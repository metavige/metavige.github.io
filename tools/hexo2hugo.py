#!/usr/bin/env python3
"""把 Hexo 的 source/_posts 轉成 Hugo 的 content/posts。

一次性遷移工具，可重複執行（每次會清空 content/posts 重建）。

處理項目：
  1. 補上 front-matter 開頭的 `---`（Hexo 容許省略，Hugo 不接受）
  2. `catalogs:` → `categories:`（舊文章的錯字，Hexo 一直靜默忽略）
  3. 加上 `slug:`，鎖定 permalink 與 Hexo 舊網址完全一致
  4. 有同名資料夾的文章轉成 Hugo page bundle（foo.md + foo/ → foo/index.md）
  5. 改寫 Hexo 專屬標籤：post_link / asset_img / gist

source/_posts 維持純 Hexo 原貌，所有 Hugo 化的轉換都集中在這裡，
所以這支腳本可以反覆重跑，結果一致。
"""

import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source" / "_posts"
DST = ROOT / "content" / "posts"

# 站主自己的 gist 帳號。Hexo 的 gist 標籤只帶 id，
# Congo 的 gist shortcode 則需要 owner。
GIST_OWNER = "metavige"

# 轉換後仍殘留的 Hexo 標籤（代表有沒處理到的語法，會在結尾報告）
LEFTOVER_TAGS = re.compile(r"\{%\s*(\w+)")

TITLE_RE = re.compile(r'^title:\s*["\']?(.*?)["\']?\s*$')

# {% post_link <slug> [顯示文字] %}
POST_LINK_RE = re.compile(r"\{%\s*post_link\s+(\S+?)(?:\s+(.+?))?\s*%\}")
# {% asset_img <檔名> [alt] %}
ASSET_IMG_RE = re.compile(r"\{%\s*asset_img\s+(\S+?)(?:\s+(.+?))?\s*%\}")
# {% gist <id> %}
GIST_RE = re.compile(r"\{%\s*gist\s+(\S+?)\s*%\}")


def split_front_matter(text: str):
    """回傳 (front_matter_lines, body)。

    支援兩種寫法：標準的 `---` 開頭，以及 Hexo 容許的省略開頭。
    """
    lines = text.split("\n")
    if lines and lines[0].strip() == "---":
        end = next(i for i, l in enumerate(lines[1:], 1) if l.strip() == "---")
        return lines[1:end], "\n".join(lines[end + 1:])

    # 沒有開頭分隔線：找第一個 `---` 當結尾
    end = next((i for i, l in enumerate(lines) if l.strip() == "---"), None)
    if end is None:
        raise ValueError("找不到 front-matter 結尾")
    return lines[:end], "\n".join(lines[end + 1:])


def convert(fm_lines, slug):
    """修正 front-matter 欄位，並補上 slug。"""
    out = []
    for line in fm_lines:
        # 錯字修正：只改欄位名，不動內容
        if line.startswith("catalogs:"):
            line = "categories:" + line[len("catalogs:"):]
        out.append(line)

    if not any(l.startswith("slug:") for l in out):
        out.append(f'slug: "{slug}"')
    return out


def collect_titles():
    """建立 slug → title 索引，給 post_link 補上顯示文字用。"""
    titles = {}
    for md in SRC.glob("*.md"):
        fm_lines, _ = split_front_matter(md.read_text(encoding="utf-8"))
        for line in fm_lines:
            m = TITLE_RE.match(line)
            if m:
                titles[md.stem] = m.group(1)
                break
    return titles


def convert_body(body: str, titles: dict) -> str:
    """把 Hexo 專屬標籤改寫成 Hugo 認得的語法。"""

    def post_link(m):
        target, text = m.group(1), m.group(2)
        # 沒指定顯示文字時，Hexo 會拿目標文章的標題來顯示
        label = text or titles.get(target, target)
        # 用 relref 而非硬編網址：連結失效時 Hugo 會在建置期直接報錯
        return f'[{label}]({{{{< relref "{target}" >}}}})'

    def asset_img(m):
        src, alt = m.group(1), (m.group(2) or "")
        # Hexo 慣例會把 alt 用中括號包起來
        alt = alt.strip().strip("[]")
        return f"![{alt}]({src})"

    body = POST_LINK_RE.sub(post_link, body)
    body = ASSET_IMG_RE.sub(asset_img, body)
    body = GIST_RE.sub(lambda m: f'{{{{< gist {GIST_OWNER} {m.group(1)} >}}}}', body)
    return body


def main():
    if not SRC.is_dir():
        sys.exit(f"找不到來源目錄：{SRC}")

    DST.mkdir(parents=True, exist_ok=True)

    # 只清掉這支腳本自己會重新產生的項目，不動 content/posts 底下的其他東西。
    # 遷移完成後在 Hugo 這邊直接新增的文章，不該被重跑腳本刪掉。
    for md in SRC.glob("*.md"):
        stale_bundle = DST / md.stem
        stale_file = DST / f"{md.stem}.md"
        if stale_bundle.is_dir():
            shutil.rmtree(stale_bundle)
        if stale_file.is_file():
            stale_file.unlink()

    titles = collect_titles()
    posts = sorted(SRC.glob("*.md"))
    bundles = 0
    rewritten = 0
    leftover = []

    for md in posts:
        slug = md.stem
        asset_dir = SRC / slug

        text = md.read_text(encoding="utf-8")
        fm_lines, body = split_front_matter(text)
        fm_lines = convert(fm_lines, slug)

        new_body = convert_body(body, titles)
        if new_body != body:
            rewritten += 1

        result = "---\n" + "\n".join(fm_lines) + "\n---\n" + new_body

        if asset_dir.is_dir():
            # 有附圖 → 轉成 page bundle，圖片相對路徑得以維持
            target_dir = DST / slug
            shutil.copytree(asset_dir, target_dir)
            target = target_dir / "index.md"
            bundles += 1
        else:
            target = DST / f"{slug}.md"

        target.write_text(result, encoding="utf-8")

        found = set(LEFTOVER_TAGS.findall(new_body))
        if found:
            leftover.append((slug, sorted(found)))

    print(f"已轉換 {len(posts)} 篇文章（其中 {bundles} 篇為 page bundle）")
    print(f"改寫 Hexo 專屬標籤：{rewritten} 篇")

    if leftover:
        print(f"\n⚠️  仍殘留未處理的標籤（{len(leftover)} 篇）：")
        for slug, tags in leftover:
            print(f"  - {slug}: {', '.join(tags)}")
    else:
        print("沒有殘留未處理的 Hexo 標籤")


if __name__ == "__main__":
    main()
