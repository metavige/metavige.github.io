---
title: "Proxy.pac is not working at Yosemite"
date: 2015-04-24 13:32:30
tags:
- mac
slug: "mac-yosemite-proxypac-not-working"
---

嘗試在本機設定 pac，結果搞了很久，才知道是 Yosemite 的問題～

<!--more-->

不管我怎樣設定，系統監視程式都是這樣的錯誤  

```
networkd[340]: -[NETProxyLookup pacLookupComplete:proxies:error:] PAC evaluation error: Error Domain=kCFErrorDomainCFNetwork Code=308 "The operation couldn’t be completed. (kCFErrorDomainCFNetwork error 308.)"
```

然後我完全不知道是為什麼！？  

不過後來我找到這篇～  
[https://discussions.apple.com/thread/6642648]()

重點就是，你的 pac 設定的時候，如果 Url 是 proxy.pac 結尾，就會發生問題！   

所以總結在 Yosemite 設定 pac 的作法  

- pac 檔案要放在本機的 web server share~ 我是安裝了一個 nginx，用 8080 port share
- 測試過，不能用 file:////, 一定要是 http://   
- 網址不可以是 proxy.pac 結尾  (喵的咧！！！ )
- 可以用 google 的 pactester 測試 pac 的程式是不是寫對  

![喵的咧](http://images.uncyc.org/zh-tw/thumb/b/b3/CATBIT.gif/120px-CATBIT.gif)
