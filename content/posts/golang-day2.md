---
title: "Golang Day 2"
date: 2017-03-08 00:00:00
categories:
- 程式開發
tags:
- golang
slug: "golang-day2"
---

## Golang 語法注意

- 格式很重要，不管是空行或者是 TAB、大括號等位置，很重要，會編譯不過。不過可以用 gofmt 工具幫你自動排版程式。
- 所有的程式需要用 package 整理，有點像是 java package/module 的觀念
- 主程式一定是 `package main`, 而且一定會呼叫 `func main()`  
- 引用不必要的 packages 會錯誤
- 沒用到的變數也會錯誤
- 不需要分號結尾
- 條件式不需要用 () 包起來 (這我就有點不習慣了～因為 Java, javascript, C# 都要)
- golang 應該不算是 OOP, 所以要習慣沒有類別 (Class) 封裝這件事情

## Reference

- [GO 聖經 - gitbook](https://wizardforcel.gitbooks.io)