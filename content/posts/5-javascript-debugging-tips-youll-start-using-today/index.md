---
title: "5 javascript debugging tips you'll start using today"
date: 2014-03-07 08:11:00
categories:
- 程式開發
tags:
- javascript
slug: "5-javascript-debugging-tips-youll-start-using-today"
---

[原文出處](http://berzniz.com/post/78260747646/5-javascript-debugging-tips-youll-start-using-today)  
這是前幾天在網路上看到的一篇文章，我懶得翻譯標題的部份 (其實我不太會翻譯)
我個人覺得很有幫助，剛好最近有在寫 [SPA](https://en.wikipedia.org/wiki/Single-page_application) 的專案  

以下是我對原文的一些自己的理解，也算是簡單的翻譯啦。  
下面用到的瀏覽器都是 Chrome (不得不說，這真的是 Web 開發者的一大利器，比起 ie 好太多了～又快～)  

<!--more-->

## debugger;

如果你需要在程式中，特別在某個區段需要讓程式中斷下來，但是，你又不想設定中斷點，你可以用 `debugger;` 這個關鍵字  
使用的時候，開啟 Chrome 的開發者工具，當執行到設定 `debugger;` 的程式地方，開發者工具就會自行中斷，就可以 debug~  

好用！   

如果需要有條件的中斷，參考下方的程式碼 (參考原文也有～)  

```javascript
for(var i in [1,2,3,4,5]) {
  if (i === 2) {
    debugger;
  }
}
```

## 在 DOM 變更的時候中斷

常常我們在寫前端程式碼的時候，會遇到一個問題，就是畫面上的 DOM   屬性變更了，但是在茫茫程式碼中，你不知道哪段程式碼做了這個屬性的變更，找也要找半天。這時候你可以透過 Chrome 的開發者工具，來設定屬性變更的時候要中斷～  

![](https://31.media.tumblr.com/b1d973ed9acfaeca5ebf67188037b1e2/tumblr_inline_n1s6xpVmg21r2dr7s.png)

設定的選項有三種：
1. 子節點變更的時候 (Subtree Modifications)
2. 屬性變更的時候 (Attributes Modifications)
3. 節點被刪除的時候 (Node Removal)

Cool~  

## Ajax 中斷

這是用在如果程式中有使用 Ajax 往後端送資料，你可以設定在送出這個 Request 的時候中斷  

![](https://31.media.tumblr.com/4aadd8ea9f9c3289f7ff7252ceebc2ee/tumblr_inline_n1s7ceQ08c1r2dr7s.png)

## 模擬不同的 Mobile 裝置

Chrome 有個蠻不錯的功能，就是能模擬不同的裝置，你可以利用這個功能，來檢查你的網站在不同的裝置中，會有怎麼樣的效果。這對 Responsive Web 的開發者來說，應該特別好用～  

要使用這個功能，你要先開啟開發者工具，然後選擇除了 Console 以外的 Tab，接下來按下 ESC 鍵，就會在下方開啟如圖的小頁籤出來，這時候就可以選擇 `Emulation`，選擇不同的 Device 來模擬  

![](/2014/03/07/5-javascript-debugging-tips-youll-start-using-today/skitch.png)

## 讓你的網站效能更好

一般來說，[YSlow](http://developer.yahoo.com/yslow/) 是在開發網頁程式會用到的一個效能評估以及建議改善的好工具，不過 Chrome 自己也有提供一個小工具，叫做 Audit，也可以做到一些簡單的效能改善建議  

![](https://31.media.tumblr.com/33b7f3c7c8f21c4786870bbd7a9fa910/tumblr_inline_n1s76yISqv1r2dr7s.png)

以上就是我對原文的一些簡單的理解與說明  
大部分的圖片都是出自於原文，但是因為第四點的圖片我個人認為有點不明顯，所以我就重新剪貼了一張～  
