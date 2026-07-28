# metavige.github.io

個人部落格原始檔。以 [Hugo](https://gohugo.io/) 建置，主題為
[Congo](https://github.com/jpanther/congo)（git submodule），
透過 GitHub Actions 自動部署到 GitHub Pages。

- 網站：<https://metavige.github.io>
- 原始檔分支：`pages-src`（推上去就會自動部署）

## 環境需求

```bash
brew install hugo          # 需要 extended 版
git clone --recurse-submodules git@github.com:metavige/metavige.github.io.git
```

已經 clone 過但主題目錄是空的：

```bash
git submodule update --init --recursive
```

## 寫文章

文章放在 `content/posts/`。

```bash
hugo new posts/my-post.md          # 純文字文章
hugo new posts/my-post/index.md    # 有附圖的文章（page bundle）
```

附圖直接放進 `content/posts/my-post/`，內文用相對路徑引用
`![說明](screenshot.png)`，Hugo 會自動產生 WebP 與各尺寸版本。

寫完把 front matter 的 `draft: true` 拿掉才會發布。

### 三個要注意的地方

- **`date` 決定網址**：`date: 2026-08-15` → `/2026/08/15/my-post/`。
  發布後才改日期等於換網址，舊連結會斷。
- **`slug` 不要刪**：permalink 規則是 `/:year/:month/:day/:slug/`，
  少了它會改用標題產生網址，中文標題會變成一長串編碼字串。
  archetype 已經幫忙填好。
- **附圖別命名為 `cover` 或 `feature`**：Congo 會用這兩個關鍵字自動抓成
  featured image 顯示在標題下方，跟內文的引用撞在一起會同一張圖出現兩次。

## 本機預覽

```bash
hugo server        # http://localhost:1313
hugo server -D     # 連草稿一起看
```

## 部署

推到 `pages-src` 就會觸發 `.github/workflows/hugo.yml`，
建置後由 `actions/deploy-pages` 直接發佈，不經過任何發布分支。

```bash
git push origin pages-src
```

## 舊網址保護

這個站在 2026 年從 Hexo 遷移過來，既有文章的網址必須維持不變，
否則外部連結、書籤與搜尋結果都會變成 404。

`tools/legacy-urls.txt` 凍結了所有必須永遠可存取的路徑
（49 篇舊文章、`/archives/` 年月封存頁、`/atom.xml`、`/tags/CSharp/`），
CI 每次建置都會跑 `tools/verify_urls.py` 比對，少了任何一個就讓建置失敗。

新增文章不需要動這份清單，它只負責確保舊網址不斷。

以下設定是為了相容舊網址而存在，改動前請先確認影響：

| 設定 | 原因 |
|---|---|
| `disablePathToLower = true` | GitHub Pages 路徑大小寫敏感，舊網址含大寫（如 `First-Electron-App`） |
| `timeZone = 'Asia/Taipei'` | 舊文章 `date` 未帶時區，若被當 UTC 解析會讓網址的日期位移一天 |
| `outputFormats.RSS.baseName = 'atom'` | 舊訂閱網址是 `/atom.xml`，Hugo 預設會輸出成 `/index.xml` |
| `pagination.pagerSize = 5` | 對齊 Hexo 的 `per_page: 5`，否則 `/page/6/`～`/page/10/` 會 404 |
| `content/posts/_index.md` 的 `aliases` | 接住舊站 37 個 `/archives/` 年月封存頁 |
