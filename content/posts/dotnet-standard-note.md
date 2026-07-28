---
title: .Net Standard 筆記
date: 2017-08-31 21:09:47
tags:
- dotnet
slug: "dotnet-standard-note"
---

## 簡單筆記

- 標準的基礎程式庫 API 介面定義
- 可以跨平台
- 目前 .Net framework 4.6.1 支援 .Net Standard 2.0 (.Net Standard 1.x 僅有 .Net Code 1.x 支援)
- .Net Standard 版本控制規則
  - 累加：較新的版本會包含較舊版本的 API
  - 不可變：版本提交後，該版本便已凍結
- 自行根據 PCL (Portable Class Library)，決定設定檔集合 (就是決定要用哪套實作的程式庫，看是要用 .Net framework 或是 .Net Core)

## 架構圖

![](https://docs.microsoft.com/zh-tw/dotnet/standard/media/components.png)

## 網路介紹文章

- [2016.09.27 .NET Standard 2.0 是什麼？可以吃嗎？ (黑暗執行緒)](http://blog.darkthread.net/post-2016-09-27-net-standard-2-0.aspx)
- [2016.04.10 ASP.NET Core 與 .Net Core, .Net Platform Standard, 以及 Shared Runtime 之間的關係 (微軟開發工具的資訊分享)](https://dotblogs.com.tw/aspnetshare/2016/04/10/20160409-netcore-netstandard)
- [2017.02.25 再來多聊一點 .Net Standard (大毛電腦科學筆記)](http://bruceyclee.tw/2017/02/25/netstandard/)
- [2017-08-20 .NET Standard 2.0 與 .NET 的未來與發展 (gelis 技術隨筆)](https://dotblogs.com.tw/gelis/2017/08/20/143437)

