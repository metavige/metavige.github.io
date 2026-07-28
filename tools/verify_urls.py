#!/usr/bin/env python3
"""確認從 Hexo 遷移過來的舊網址都還活著。

基準是 tools/legacy-urls.txt——一份在遷移當下凍結的快照，記錄了
所有「必須永遠可存取」的路徑：49 篇舊文章、archives 年月封存頁、
RSS，以及靠 alias 接住的 /tags/CSharp/。

這些路徑一旦消失，既有的外部連結、書籤與搜尋結果就會變成 404，
所以 CI 每次建置都會跑這支檢查。

新增文章不需要動 legacy-urls.txt——這份清單只管舊網址不要斷，
不管新增了什麼。

用法：先跑 hugo，再跑本腳本。
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNAPSHOT = ROOT / "tools" / "legacy-urls.txt"
PUBLIC = ROOT / "public"


def load_snapshot():
    if not SNAPSHOT.is_file():
        sys.exit(f"找不到基準快照：{SNAPSHOT}")
    urls = []
    for line in SNAPSHOT.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            urls.append(line)
    return urls


def resolve(url: str) -> bool:
    """檢查這個網址在 public/ 裡有沒有對應的實體檔案。"""
    target = PUBLIC / url.lstrip("/")
    if target.is_file():
        return True
    # 目錄形式的網址，實際檔案是底下的 index.html
    return (target / "index.html").is_file()


def main():
    if not PUBLIC.is_dir():
        sys.exit(f"找不到 {PUBLIC}，請先執行 hugo")

    urls = load_snapshot()
    missing = [u for u in urls if not resolve(u)]

    print(f"檢查 {len(urls)} 個必須保留的舊網址")

    if missing:
        print(f"\n❌ 以下舊網址在新站找不到，上線後會變成 404：{len(missing)} 筆")
        for u in missing:
            print(f"  {u}")
        print("\n這通常表示某篇文章的 slug、date 或 alias 被改動了。")
        return 1

    print("✅ 全部都在，沒有任何舊連結會斷")
    return 0


if __name__ == "__main__":
    sys.exit(main())
