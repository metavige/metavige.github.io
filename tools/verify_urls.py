#!/usr/bin/env python3
"""比對 Hugo 產出的文章網址是否與 Hexo 舊網址完全一致。

舊網址規則來自 Hexo 的 permalink 設定 `:year/:month/:day/:title/`，
其中 :title 取的是原始檔名，日期取自 front-matter 的 date。

用法：先跑 `hugo`，再跑本腳本。
"""

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source" / "_posts"
SITEMAP = ROOT / "public" / "sitemap.xml"

DATE_RE = re.compile(r"^date:\s*(\d{4})-(\d{2})-(\d{2})")


def expected_urls():
    """從 Hexo 原始檔推導出舊網址。"""
    urls = {}
    for md in sorted(SRC.glob("*.md")):
        for line in md.read_text(encoding="utf-8").split("\n"):
            m = DATE_RE.match(line)
            if m:
                y, mo, d = m.groups()
                urls[f"/{y}/{mo}/{d}/{md.stem}/"] = md.name
                break
        else:
            print(f"  ! {md.name} 找不到 date 欄位")
    return urls


def actual_urls():
    """從 Hugo 產出的 sitemap 取出實際網址。"""
    if not SITEMAP.is_file():
        sys.exit(f"找不到 {SITEMAP}，請先執行 hugo")

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    tree = ET.parse(SITEMAP)
    found = set()
    for loc in tree.iterfind(".//sm:url/sm:loc", ns):
        path = re.sub(r"^https?://[^/]+", "", loc.text)
        # 只看形如 /YYYY/MM/DD/slug/ 的文章網址
        if re.fullmatch(r"/\d{4}/\d{2}/\d{2}/[^/]+/", path):
            found.add(path)
    return found


def main():
    # Hexo 來源清掉之後就沒有比對基準了，這時直接跳過而不是讓 CI 失敗
    if not SRC.is_dir():
        print(f"找不到 {SRC}，Hexo 來源已移除，跳過網址比對")
        return 0

    expected = expected_urls()
    actual = actual_urls()

    missing = sorted(set(expected) - actual)
    extra = sorted(actual - set(expected))

    print(f"Hexo 舊網址：{len(expected)} 筆")
    print(f"Hugo 新網址：{len(actual)} 筆")

    if missing:
        print(f"\n❌ 遺失（舊網址在新站找不到，會產生 404）：{len(missing)} 筆")
        for u in missing:
            print(f"  {u}  <- {expected[u]}")

    if extra:
        print(f"\n⚠️  多出（新站有但舊站沒有）：{len(extra)} 筆")
        for u in extra:
            print(f"  {u}")

    if not missing and not extra:
        print("\n✅ 完全一致，所有文章網址都對得起來")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
