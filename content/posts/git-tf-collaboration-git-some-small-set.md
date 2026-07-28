---
title: "Git-Tf 協同作業，Git 的一些小設定"
date: 2014-07-16 20:04:00
categories:
- 程式開發
tags:
- mac
- git
slug: "git-tf-collaboration-git-some-small-set"
---

本身有用 Windows, Mac 在開發系統，我其實是偏好在 Mac 編輯，因為我喜歡 [Sublime Text](http://www.sublimetext.com/3) !!!  

不過，在 Windows 中用 Visual Studio 2013, 公司內部是規定使用 TFS （老實說我不是很喜歡，不過整個團隊以及公司都是這樣，也不得不用～）  

有些時候，不想使用笨重的 VS2013，像是開發 Web Project，我還是喜歡用 [Sublime Text](http://www.sublimetext.com/3) 編輯，像是 javascript/html 都有不錯的開發經驗～
所以只好用 [git-tf](https://gittf.codeplex.com) 來做界接～  

<!--more-->

要在 Mac 上安裝 [git-tf](https://gittf.codeplex.com) 很容易，你只需要使用 [brew](http://brew.sh) 就可以安裝  

```bash
brew install git-tf
```

不過在使用 [git-tf](https://gittf.codeplex.com) 的過程中，有些 Windows/Mac 之間的差異性，導致每次我常常要 Checkin 一堆檔案，就算我沒改這些檔案，經過幾番摸索，終於找到大部分的設定，可以讓 Windows/Mac 之間更容易的整合，特此記錄！  

- 行尾符號 - 因為 Windows 是 CRLF，不過 Mac 只有 LF

```bash
git config core.autocrlf false
```
- 空格問題 - trailing-space 會查找每行結尾的空格, cr-at-eol 告訴 Git carriage returns 是合法的

```bash
git config core.whitespace trailing-space,cr-at-eol
```
- 大小寫問題 - Windows 檔名是沒有大小寫分別的，不過 Mac 有，這就看個人所需了

```bash
git config core.ignorecase true
```

以上設定，只需要加上 --global 就可以設定在全域設定上 (~/.gitconfig)，以上資料參考 [git 的配置文件](http://git-scm.com/book/zh-tw/Git-客製化-Git-配置)  
