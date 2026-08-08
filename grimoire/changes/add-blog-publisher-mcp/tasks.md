# Tasks — add-blog-publisher-mcp

> 由 grimoire:plan 產出；grimoire:cast 由上而下逐項執行並勾選。順序即依賴。
> 每項含驗證方式；行為變更標注 `[TDD]`；驗證只能以人工觀察達成者標注 `[human-verify]`。

## 1. 環境與骨架

- [x] 1.1 安裝與 CI 同版的 hugo **extended 0.164.0**（`hugo.yml:30` 鎖定；brew 版本不符就改下載官方 release binary 進 PATH），並驗證整站可 build｜驗證：`hugo version` 輸出含 `0.164.0` 與 `extended`；repo 根目錄 `hugo --renderToMemory --quiet` exit 0 (tier: 中階)
- [x] 1.2 查證 2026 當前最新 MCP spec 版本與官方 TypeScript SDK 最新 stable（官方文件優先：modelcontextprotocol.io 與 SDK repo；**實作前先查官方文件**），把 spec 版號、SDK package 名與版號、stdio server 最小範例出處 URL 記錄到本檔末「查證附註」段｜驗證：「查證附註」段存在且三項齊備、各附出處 URL (tier: 中階)
- [ ] 1.3 scaffold `tools/blog-publisher-mcp/`：npm + TypeScript + 官方 SDK（版本依 1.2 查證結果鎖定），可啟動的 stdio server 註冊 `publish_post` 工具骨架（暫回未實作錯誤）；repo 根目錄新增 `.mcp.json` 註冊此 server（PUB-R-01）｜驗證：以 stdio 送 JSON-RPC `initialize`＋`tools/list`，回應含 `publish_post`；`npm test` 可執行且綠（骨架測試）(blocked-by: 1.2; tier: 同級)

## 2. 核心行為

> ⚠ 拆分邊界：2.1–2.3 皆改 publish 流程同一模組的相鄰區塊——各自獨立 commit，勿一次寫完。

- [ ] 2.1 [TDD] 參數驗證與 page bundle 建立（PUB-R-02、R-03、R-07、R-08、R-09）：slug 格式檢查、既存 bundle 檢查、assets 存在檢查、frontmatter 組裝（title/date/slug/tags/categories，date 本機時間 `YYYY-MM-DD HH:MM:SS`）、assets 複製｜驗證：`npm test` 全綠，測試涵蓋 EX-A#2、EX-B#2、EX-C 全列（錯誤時零檔案變更）(blocked-by: 1.3; tier: 同級)
- [ ] 2.2 [TDD] hugo build 驗證關卡（PUB-R-04、R-10）：bundle 建立後執行本機 hugo build；失敗回 E-BUILD-FAILED 附錯誤輸出、不 commit 不 push、檔案保留供檢查｜驗證：`npm test` 全綠，含 EX-D#1 case（以會使 build 失敗的內容實測）(blocked-by: 2.1; tier: 同級)
- [ ] 2.3 [TDD] git commit＋push 與 URL 回傳（PUB-R-05、R-06、R-11）：英文 commit message 沿用 `doc: add new article "<title>"` 慣例、push origin master 禁止 force、成功回傳預期上線 URL（`hugo.toml:27` permalink 規則）；push 被拒回 E-PUSH-REJECTED、本地 commit 保留｜驗證：`npm test` 全綠，git 操作以暫存 repo fixture 測試，含 EX-D#2 non-fast-forward case (blocked-by: 2.2; tier: 同級)

## 3. 端對端驗收

- [ ] 3.1 Claude Code 註冊實測（PUB-R-01）｜驗證：於 repo 目錄執行 `claude mcp list`，輸出含 blog-publisher-mcp 且狀態為可連線 (blocked-by: 2.3; tier: 最小可用)
- [ ] 3.2 端對端真發驗證＋下架：透過 MCP client 真呼叫 `publish_post` 發佈測試文章（使用者已核可短暫上線）；再對同 slug 重呼叫實測 EX-C#3｜驗證：`git log -1` 顯示英文 commit；`gh run watch` GitHub Actions 綠；`curl -o /dev/null -s -w '%{http_code}' <文章URL>` 回 200；EX-C#3 回 E-SLUG-EXISTS 且 `git status --porcelain` 乾淨；revert commit 後 push、Actions 綠、文章 URL 回 404；全程 `git diff --stat` 確認既有檔案零改動 (blocked-by: 3.1; tier: 主對話)

## 查證附註（task 1.2，查證於 2026-08-08，主 agent 已抽驗 npm registry 與 spec 版本頁）

- **MCP spec 最新版**：`2026-07-28`（Current；相對 2025-11-25 有重大不相容變更：移除 initialize handshake 與 session、新增 `server/discover`）。出處：https://modelcontextprotocol.io/specification/versioning 、 https://modelcontextprotocol.io/specification/2026-07-28/changelog
- **TypeScript SDK**：v2 拆分套件，server 端用 **`@modelcontextprotocol/server` v2.0.0**（舊 `@modelcontextprotocol/sdk` 停在 1.30.0，為 legacy v1，勿用）。出處：https://registry.npmjs.org/@modelcontextprotocol/server/latest
- **stdio server 最小範例**：typescript-sdk repo `docs/get-started/first-server.md`——`McpServer` + `registerTool`（zod/v4 inputSchema）+ `serveStdio(() => server)`；package.json 需 `"type": "module"`（ESM only）；**stdout 是協定通道，log 一律 `console.error`**。出處：https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/get-started/first-server.md
