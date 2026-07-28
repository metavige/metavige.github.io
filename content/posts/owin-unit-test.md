---
title: "OAuth2 測試 - Microsoft.Owin.Testing"
date: 2015-03-25 16:31:24
categories:
- 程式開發
tags:
- Owin
- csharp
- .Net
- Test
- OAuth2
slug: "owin-unit-test"
draft: true
---

我還是不喜歡手動用網頁一步一步測試～太浪費時間。
尤其是如果編譯系統、開啟 IIS Express、輸入資料，這樣一步一步做下來，每次都要花上快一分鐘的時間，我就會覺得整個思考都卡住了～

(雖然我其實程式都寫的差不多了～～～)
不過為了多加一些測試的案例，想說去找找 Owin 針對測試案例做的範例
這樣我就可以把可能的測試作法都寫成 Test Case，之後有修改作法，只要跑一次全部的測試案例就好～

<!--more-->

安裝以下 Package

```
Install-Package Nancy.Owin
Install-Package Microsoft.AspNet.WebApi.OwinSelfHost
Install-Package Microsoft.Owin.Testing
```


參考
- [MSDN Blog - Unit testing OWIN applications using TestServer](http://blogs.msdn.com/b/webdev/archive/2013/11/26/unit-testing-owin-applications-using-testserver.aspx)
- [INTEGRATION TESTING AUTHENTICATED KATANA APPLICATIONS](http://www.aaron-powell.com/posts/2014-01-12-integration-testing-katana-with-auth.html)
- [github - aaronpowell/Owin.AuthenticatedTests](https://github.com/aaronpowell/Owin.AuthenticatedTests/tree/a154931dd82e5180daf7163c2129f3a90401df55)
- [http://www.strathweb.com/2013/12/owin-memory-integration-testing/]()
- [http://www.vannevel.net/2015/03/21/how-to-unit-test-your-owin-configured-oauth2-implementation/]()
