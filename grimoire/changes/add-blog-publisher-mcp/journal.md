# Journal — add-blog-publisher-mcp

1.1 · 非預期狀況 · hugo 0.164.0 的 macOS release 只出 .pkg（無 tar.gz），以 `pkgutil --expand-full` 免 sudo 解出 binary 安裝到 `~/.local/bin`

2.2 · 非預期狀況 · hugo `--quiet` 連 ERROR 行都吞掉（exit 1 但 stderr/stdout 全空），E-BUILD-FAILED 拿不到原因——build 關卡改為不帶 `--quiet`，僅在失敗時回傳輸出
