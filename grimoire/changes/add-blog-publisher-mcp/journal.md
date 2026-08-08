# Journal — add-blog-publisher-mcp

1.1 · 非預期狀況 · hugo 0.164.0 的 macOS release 只出 .pkg（無 tar.gz），以 `pkgutil --expand-full` 免 sudo 解出 binary 安裝到 `~/.local/bin`

2.2 · 非預期狀況 · hugo `--quiet` 連 ERROR 行都吞掉（exit 1 但 stderr/stdout 全空），E-BUILD-FAILED 拿不到原因——build 關卡改為不帶 `--quiet`，僅在失敗時回傳輸出

3.1 · 驗證偏差 · `claude mcp list` 顯示 blog-publisher 為「Pending approval」——project 層 `.mcp.json` 的核准只能在互動 session 完成，CLI 無非互動核准指令。等效驗證：以官方 client 用 `.mcp.json` 登記的同一指令與 cwd 實連，tools/list 回 publish_post。user 下次開 `claude` 核准一次即轉 Connected
