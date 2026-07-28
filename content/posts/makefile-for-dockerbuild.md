---
title: "Makefile for Docker Build"
date: 2017-03-28 21:34:06
categories:
- 程式開發
tags:
- docker
slug: "makefile-for-dockerbuild"
---

其實我對 Makefile 算是一知半解，趁此機會學習一下    

<!--more-->

我最近寫的一個 Makefile  

```
IMAGE_NAME=apt-cacher-ng
PUSH_NAME=registry.co/nebula/${IMAGE_NAME}:v20170328

build:
  docker build -t ${IMAGE_NAME} .

push:
  docker tag ${IMAGE_NAME} ${PUSH_NAME} && docker push ${PUSH_NAME} && docker rmi ${PUSH_NAME}
```

老實說，我也不知道什麼才是對的，只是這樣我可以跑，好像就是對的勒  
真的看了 Makefile 的教學之後才發現自己錯很多地方  

- 我沒寫 `.PHONY`
- 我不知道還有相依性這種東西？？
- 原來裡面可以把檔案當作相依性的檢查，然後用來執行要執行的 task。
- 以往都是笨笨的自己下一堆 `make target` 的動作，還想說 Makefile 真難用。原來可以一個相依另外一個，只需要下一次 `make` 就好
- `$<` 等於相依的資料，`$@` 表示 target 本身，`%` 則是樣式規則.....學起來

所以，算了，參考別人的東西 [Makefile](https://github.com/mvanholsteijn/docker-makefile) 之後自己慢慢學好了  

- [Makefile 範例教學](https://maxubuntu.blogspot.tw/2010/02/makefile.html)



