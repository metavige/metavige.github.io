---
title: "Golang Day 1"
date: 2017-03-06 22:00:00
categories:
- 程式開發
tags:
- golang
slug: "golang-day1"
---

## 安裝

```
brew install golang
```

## 環境設定

- `GOROOT`: GO 安裝的地方，用 `brew` 安裝的，可以設定 `/usr/local/opt/go/libexec` 就可以
- `GOPATH`: GO 執行的時候要的路徑，看專案在哪邊就設定在哪邊

## GOPATH

一般是指向專案位置，裡面還會切分三個目錄

- src: 一般程式碼放的地方，可以包含網址．比如說 github.com/golang/golint 這樣的方式
- pkg: 編譯後的檔案
- bin: binary file

## Empty Go

```golang
package main

func main() {

}
```

注意空行以及大括弧的位置，golang 很注意**程式碼格式**！

## HelloWorld

```golang
package main

import "fmt"

func main() {
    fmt.Println("Hello, World")
}
```