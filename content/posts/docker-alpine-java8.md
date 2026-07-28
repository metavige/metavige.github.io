---
title: "Make Java 8 docker image based Alpinelinux "
date: 2015-11-03 22:52:59
tags:
- docker
- java
slug: "docker-alpine-java8"
---

製作 Java base docker image based [Alpinelinux](http://alpinelinux.org/)

<!--more-->

之前找了時間，想做個小一點的 java8 docker image  
因為 offical java8 image 有約 800 多 mb，所以考慮用 [Alpinelinux](http://alpinelinux.org/) 來做 base  
因為  [Alpinelinux](http://alpinelinux.org/) 只有 5MB 多  

不過在安裝的時候，發現下載了 JDK 解壓縮之後，一直無法執行 java   
透過 apk 也只能找到 java7  

上網搜尋了一下，發現了有這個 [issue](https://github.com/gliderlabs/docker-alpine/issues/11)   
也參考了別人寫的 [Dockerfile](https://github.com/anapsix/docker-alpine-java)  

記錄下來！

### github 連結

[https://github.com/metavige/alpine-java]()

### 後記

另外，找到一個有趣的服務 [ImageLayers.io](https://imagelayers.io)   
透過這個服務，可以看你這個 Docker Image 有幾層以及大小，可以用這個來檢視自己做 docker image 的方式，看看是否還有縮小的空間～  
不錯用！！！  

[![](https://badge.imagelayers.io/metavige/alpine-java:latest.svg)](https://imagelayers.io/?images=metavige/alpine-java:latest 'Get your own badge on imagelayers.io')
