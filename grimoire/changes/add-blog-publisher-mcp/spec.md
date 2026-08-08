---
status: planned
capabilities: [blog-publishing]
created: "2026-08-08"
---

# add-blog-publisher-mcp

> Capability prefix: PUB

## Why

想讓 ChatGPT 參與 blog 發文流程。原構想是讓 ChatGPT 直連 MCP（GitHub 官方 remote MCP 或自建 remote server），但查證後確認 **ChatGPT Go 方案不支援自訂 MCP connector**（Developer Mode 僅開放 Pro/Plus/Business/Enterprise/Education，出處：developers.openai.com 的 Developer Mode 指南），該路線在現有訂閱下走不通。

改採分工：**ChatGPT 只負責寫文章，本地負責發佈**。使用者把 ChatGPT 產出的文章貼給 Claude Code，由本地 MCP server 完成確定性的發佈機制（組 frontmatter、建 page bundle、驗證、commit、push）。同時藉此練手 2026 新版 MCP 規格的 server 實作。

## What Changes

- 新增 `tools/blog-publisher-mcp/`：TypeScript stdio MCP server，暴露單一工具 `publish_post`
- 新增 repo 根目錄 `.mcp.json`：向 Claude Code 註冊此 server
- 發文工作流變為：ChatGPT 寫 → 貼給 Claude Code → Claude 建議 slug/tags/categories → 使用者確認 → 呼叫 `publish_post` → 工具建檔、hugo build 驗證、commit、push → 回傳預期上線 URL → 上線驗證由對話層順手做
- 受影響 capability 候選：無既有 canon（本 change 為 grimoire 初始化後第一個 change）

## Decisions

- **ChatGPT 直連 MCP（已否決）**：Go 方案無 Developer Mode/自訂 connector；GitHub 官方 remote MCP、自建 remote MCP（Cloudflare Workers + OAuth）兩案皆因此作廢。升級 Plus 與 Codex CLI 路線（後者可行性未查證）由使用者裁決不採
- **形態：本地 stdio MCP server**（vs Claude Code skill/script）：使用者明示想藉此練 MCP；未來可給其他支援 MCP 的工具共用
- **語言：TypeScript**：MCP 參考 SDK、規格新功能最先落地；`npx` 啟動免編譯部署
- **位置：本 repo `tools/blog-publisher-mcp/`**（vs 獨立 repo）：與發文慣例同 repo 版控、同步演化；Hugo 只建 `content/` 不受影響
- **智慧與機制分離**：slug/tags/categories 的建議與確認發生在 Claude Code 對話層；`publish_post` 只吃已確認的參數，行為完全確定性
- **push 前本機 hugo build 驗證**：壞 frontmatter/markdown 會讓 GitHub Actions 紅掉、文章發不出去；本機先擋
- **自動化止於 push**：上線驗證（等 Actions、curl 200）留在對話層，不進工具
- **驗收採真發測試文再 revert**：dry-run 掩不到真實副作用（judgment.md §2），短暫上線可接受，使用者已裁決

## Constraints

- MCP 規格與 SDK：採用官方 TypeScript SDK 最新 stable release（對應 2026 當前最新 MCP spec 版本；plan 階段查證確切版號，不憑印象寫死）
- 本機 hugo 需與 CI 同版：**hugo extended 0.164.0**（`hugo.yml:30` 鎖定；本機目前未安裝，cast 時安裝）
- 發文 commit message 用英文、沿用 repo 慣例 `doc: add new article "<title>"`（見 commit 464bbb3）
- 文章 frontmatter 沿用既有慣例：`title`、`date`（本機時間，格式 `YYYY-MM-DD HH:MM:SS`）、`slug`、`tags`、`categories`（參照 `content/posts/build-your-own-workflow/index.md`）
- 禁止 force push；push 僅 fast-forward 到 `origin master`
- 不得改動 `tools/` 既有檔案（`verify_urls.py` 為 CI 依賴、`legacy-urls.txt` 為其資料）
- server 不持有任何 credential；git 操作沿用本機既有的 git 認證

## Glossary

| 詞彙 | 定義 |
|---|---|
| page bundle | Hugo 的文章目錄形式：`content/posts/<slug>/index.md` ＋同目錄資源檔 |
| slug | 文章的 URL 識別字，kebab-case（`^[a-z0-9]+(-[a-z0-9]+)*$`） |
| frontmatter | index.md 開頭的 YAML 區塊，欄位見 Constraints |
| asset | 隨文章發佈的資源檔（如圖片），複製進 page bundle 的檔案 |
| 預期上線 URL | `https://metavige.github.io/:year/:month/:day/:slug/`（`hugo.toml:27` permalink 規則，年月日取 frontmatter date） |
| E-SLUG-INVALID | 錯誤碼：slug 不符合 kebab-case 格式 |
| E-SLUG-EXISTS | 錯誤碼：同 slug 的 page bundle 已存在 |
| E-ASSET-MISSING | 錯誤碼：assets 參數中有路徑不存在 |
| E-BUILD-FAILED | 錯誤碼：本機 hugo build 失敗 |
| E-PUSH-REJECTED | 錯誤碼：push 被 remote 拒絕（non-fast-forward 等） |

## Rules

- **PUB-R-01** THE blog-publisher server SHALL 以 stdio transport 註冊於 repo 根目錄 `.mcp.json`，供 Claude Code 連接
- **PUB-R-02** WHEN 收到參數合法的 `publish_post` 呼叫 THE blog-publisher server SHALL 建立 `content/posts/<slug>/index.md`，frontmatter 含 title、date、slug、tags、categories 五欄
- **PUB-R-03** WHERE 呼叫附 assets 參數 THE blog-publisher server SHALL 在執行 hugo build 前將每個 asset 檔案複製進 page bundle
- **PUB-R-04** WHEN page bundle 建立完成 THE blog-publisher server SHALL 執行本機 hugo build 驗證
- **PUB-R-05** WHEN hugo build 成功 THE blog-publisher server SHALL 以英文 commit message（repo 慣例格式）commit 該 page bundle 並 push 到 origin master
- **PUB-R-06** WHEN push 成功 THE blog-publisher server SHALL 回傳預期上線 URL
- **PUB-R-07** IF slug 不符合 kebab-case 格式 THEN THE blog-publisher server SHALL 回傳 E-SLUG-INVALID 且不建立任何檔案
- **PUB-R-08** IF `content/posts/<slug>/` 已存在 THEN THE blog-publisher server SHALL 回傳 E-SLUG-EXISTS 且不修改任何既有檔案
- **PUB-R-09** IF assets 中任一路徑不存在 THEN THE blog-publisher server SHALL 回傳 E-ASSET-MISSING 且不建立任何檔案
- **PUB-R-10** IF hugo build 失敗 THEN THE blog-publisher server SHALL 回傳 E-BUILD-FAILED（附 build 錯誤輸出）且不執行 commit 與 push
- **PUB-R-11** IF push 被 remote 拒絕 THEN THE blog-publisher server SHALL 回傳 E-PUSH-REJECTED 且不執行 force push

<!-- 覆蓋順序：R-07～R-09 為參數驗證，全部通過才進 R-02 建檔；R-10 發生時已建檔（檔案保留供檢查、未 commit）；R-11 發生時已 commit（本地 commit 保留、未 push）。 -->

## Examples

### EX-A：發佈成功（→ PUB-R-02, PUB-R-04, PUB-R-05, PUB-R-06）

| # | 輸入 | 預期結果 | 備註 |
|---|---|---|---|
| 1 | title="測試文", slug="test-post", tags=["AI"], categories=["思考"], 無 assets | bundle 建立、build 過、commit＋push、回傳 `https://metavige.github.io/<今日 y/m/d>/test-post/` | happy path |
| 2 | 同上但 tags=[]、categories=[] | 同上，frontmatter 中 tags/categories 為空清單 | 空清單合法 (邊界) |

### EX-B：附 assets 發佈（→ PUB-R-03, PUB-R-09）

| # | 輸入 | 預期結果 | 備註 |
|---|---|---|---|
| 1 | assets=["/tmp/cover.png"]（檔案存在） | cover.png 出現在 bundle 內、隨 commit 發佈 | |
| 2 | assets=["/tmp/missing.png"]（不存在） | E-ASSET-MISSING，`content/posts/` 無新目錄 | 驗證先於建檔 |

### EX-C：參數驗證失敗（→ PUB-R-07, PUB-R-08）

| # | 輸入 | 預期結果 | 備註 |
|---|---|---|---|
| 1 | slug="Test_Post" | E-SLUG-INVALID，無檔案變更 | 大寫＋底線 |
| 2 | slug="test-post-" | E-SLUG-INVALID，無檔案變更 | 尾端連字號 (邊界) |
| 3 | slug="build-your-own-workflow"（已存在） | E-SLUG-EXISTS，既有文章一 byte 未變 | |

### EX-D：build／push 失敗（→ PUB-R-10, PUB-R-11）

| # | 輸入 | 預期結果 | 備註 |
|---|---|---|---|
| 1 | content 含使 hugo build 失敗的內容（如非法 shortcode） | E-BUILD-FAILED 附錯誤輸出；`git log` 無新 commit；bundle 檔案保留供檢查 | |
| 2 | remote 已有本地沒有的新 commit（non-fast-forward） | E-PUSH-REJECTED；本地 commit 保留；remote 未被 force 覆寫 | 手動造 remote 領先情境 |

## Out of Scope

- ChatGPT 直連本 server（Go 方案不支援 connector；升級方案後另開 change）
- 文章的更新、刪除、草稿（draft）支援——本 change 只做新發佈
- remote/HTTP transport 與 OAuth——stdio 本地使用，無網路暴露
- slug/tags/categories 的智慧建議——屬 Claude Code 對話層行為，不進 server
- 上線驗證（等 GitHub Actions、curl 確認 200）——對話層順手做
- `og:image` 等進階 frontmatter 欄位——需要時對話層直接編輯檔案

## 開工前現況

| 對象 | 現值 | 門檻 | 判讀 |
|---|---|---|---|
| `tools/blog-publisher-mcp/` | ⚠ 量不到（尚不存在） | — | 本 change 新建 |
| `.mcp.json` | ⚠ 量不到（尚不存在） | — | 本 change 新建 |
| `content/posts/` | 56 個項目 | — | 既有文章，不得改動 |
| 本機 hugo | 未安裝（`which hugo` 無輸出） | — | cast 時裝 extended 0.164.0（`hugo.yml:30`） |
| node / npm | v22.20.0 / 10.9.3 | — | 符合 TypeScript SDK 需求 |
| `tools/verify_urls.py`、`legacy-urls.txt` | 存在，CI 使用中（`hugo.yml:56`） | — | 不得改動 |

## Questions

（無——凍結前已全數裁決，見 Decisions）

## 驗收條件

- [ ] `.mcp.json` 存在且註冊 blog-publisher-mcp；Claude Code 重啟後可列出 `publish_post` 工具（PUB-R-01）
- [ ] server 單元測試全綠（`npm test` 於 `tools/blog-publisher-mcp/`，覆蓋 EX-A～EX-D 各列）
- [ ] 端對端真發驗證：以 `publish_post` 發佈一篇測試文章，`git log -1` 顯示英文 commit、push 成功、GitHub Actions 綠、文章 URL 回 200；驗證後 revert commit 下架（使用者已核可此短暫上線）
- [ ] 對已存在 slug 呼叫 → 回 E-SLUG-EXISTS 且 `git status` 乾淨（EX-C#3 實跑）
- [ ] 既有檔案零改動：`git diff --stat master@{發文前}` 只含新增的 bundle 與 revert
