---
title: "How to Get Node.js Logging Right"
date: 2016-05-31 21:24:33
tags:
- nodejs
categories:
- 程式開發
slug: "how-to-get-nodejs-logging-right"
---

[How to Get Node.js Logging Right](https://blog.risingstack.com/node-js-logging-tutorial/)

<!--more-->

## Node.js Logging 需求 

1. Timestamp - 紀錄事件發生的時間點。***很重要***！
2. Logging format - 記錄格式。寫出的紀錄當然要是可讀性高的。
3. Log destination - 很多 Log 的工具有提供紀錄到不同地方的功能。作者認為我們應該只使用 standard output/error。因為這不是 application 所應該要做的事情。(筆記！
4. Log Level - 能夠紀錄 Log 的等級！用來區分不同等級的資料，之後也好做處理。

## Log 技巧

- never, ever log credentials, passwords or any sensitive information.
- Adding correlation IDs: 利用 correlation IDs，當有 Log 是一個長時間處理的功能，需要有前後關聯的時候，透過一個 correlation ID 可以知道紀錄的關係。







 

