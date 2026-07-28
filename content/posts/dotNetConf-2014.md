---
title: "dotNetConf 2014"
date: 2014-07-12 10:00:00
categories:
- 程式開發
tags:
- dotnet
slug: "dotNetConf-2014"
---

[dotNetConf 2014](http://blogs.msdn.com/b/dotnet/archive/2014/07/02/dotnetconf-2014-wrapup.aspx) 的影片已經可以在 Channel 9 找到了  

我看了三個項目  

- [(KeyNote) .Net State](http://channel9.msdn.com/Events/dotnetConf/2014/The-State-of-NET)
- [Asp.Net MVC 6](http://channel9.msdn.com/Events/dotnetConf/2014/MVC-6)
- [New Innovation in .Net](http://channel9.msdn.com/Events/dotnetConf/2014/New-Innovations-in-NET-Runtime)

老實說改變很大  

<!--more-->

- 因為之前 Asp.Net, Asp.Net MVC, WebForm 的相似度太大，但是程式碼是分開的，因為是階段性做出來的，所以現在要整合了～感覺上，Java 學起來比較累，但是，就是因為他一切從簡，所以才有擴充的空間。dotNet 的問題大概就是，想整合太多東西，現在包袱很重.....所以現在要來個大改版～
- 終於，dotNet 開源了～而且，也考慮到非 Windows 的用戶，所以 .Net Runtime 也要改版，準備要在不同平台上面 Run
- 蠻多東西，感覺上 Java 好像都已經做過了，所以表示，語言也是互相學習的。像是 Java 8 最近的新 feature 就是學習 C# 不少～
- 你不需要預先安裝 .Net framework，因為 .net 現在也是一個 nuget package, 表示你可以需要的時候再安裝，而且可以不同專案裝不同的 runtime，Good!!!
- 大家都想跨足到 Cloud，所以表示，你必須要考慮到 Multi-Client，以前的 WebForm 大概.....會消失了吧～所以 MVC 變成是王道啦～～～還好我在 Java 學的不少～

另外有幾個部分我自己覺得蠻有趣，也應該是對 Developer 有益的地方  

- 搭配 VS2014, compile on fly - 這是你可以邊改程式，存檔後，編譯器就會自動幫你編譯，你可以直接整理網頁就好，不需要自己在 Build 一次，這也是我用 VS 覺得最麻煩的地方。因為以前在 Java，都是存檔完後就好，不需要再自己編譯一次
- interface, implementation 分離 - 這次 dotNet 設計了一個 OWIN 介面，並且把 .net runtime 整個實做與介面分離，這我覺得大概是最棒的一個部分了。因為這樣，你就可以有不同的 implementation，crossplatform 的未來，就可預見，不像之前，你還要裝個 mono, 但是還要考慮是否可以整合～～～
- Asp.Net 已經可以不需要靠 IIS 就可以執行。這點，對開發者是蠻有幫助的，未來在開發的時候，你或許可以在測試的時候，啟動一個 self host 來做整合測試，而不需要把程式部署才能測試。甚至，未來或許你在部署程式的時候，也可以用一段很簡單的scirpt 把程式碼從 DCVS 下載下來，及時編譯後，直接執行便可以使用。
- 內建整合 DI - 我想這跟 Java 一樣，因為 Spring 紅了，而且也真的讓程式碼的耦合性降低，但是官方本身的 runtime 一直不內建，所以你必須一定要安裝 third party 的套件來支援。現在整個內建支援，表示 runtime 本身也對 DI 做了一些改變，可以直接使用。所以 DI 的觀念一定要有了！！！
