---
title: "redux-study-day3"
date: 2015-10-19 20:46:31
tags:
slug: "redux-study-day3"
draft: true
---

<!--more-->

## Middleware

Store 要開始實作，我想最難的應該是去理解一堆所謂的 Middleware....

其實所謂的 Middleware，在很多語言中目前都有類似的實現，如果以 Web 開發程式的部分來舉例的話，就有點像是 filter 的感覺 (這是我的理解)  
所以，Middleware 其實算是以 AOP 概念的方式做出來的一個實作  
用過 Java springframework 的人應該算是熟悉的～～～   

我找到一篇對岸的文章: [[譯] 深入淺出 Redux 中間件](http://blog.kazaff.me/tags/redux-thunk/)  
原文出處是:  [Understanding Redux Middleware](https://medium.com/@meagle/understanding-87566abcfb7a)    
寫的不錯！
  
hacker news 的範例，其實有用到幾個 Middleware 的部份，我大概找了一下其中幾個東西，並確認了一下為什麼要用這個東西。  

### redux-thunk

```bash
npm install --save-dev redux-thunk
```

