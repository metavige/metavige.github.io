---
title: "Redux Study Day2 - Action"
date: 2015-10-19 20:03:15
tags:
- javascript
- reactjs
- redux
categories:
- 程式開發
slug: "redux-study-day2"
---

* [Redux Study Day1 - Start]({{< relref "redux-study-day1" >}})
* [Redux Study Day2 - Action]({{< relref "redux-study-day2" >}})
* [Redux Study Day3 - Reducer]({{< relref "redux-study-day-3" >}})
* [Redux Study Day4 - Store]({{< relref "redux-study-day4" >}})

延續[前一天]({{< relref "redux-study-day1" >}})的學習，今天進入 Redux Day2!

<!--more-->

先從簡單的 Action 開始做  

## Action

一般來說 Action 就是 View 要與資料做互動的一個介面，View 自己本身不會變更 View 自己的畫面資料，而是透過呼叫 Action。  
詳細的流程可以參考 Flux 的流程圖！  

基本的 Action 都會包含兩種東西  

* type: Action Type
* payload: Payloads

如果參考 [Flux Standard Action](https://github.com/acdlite/flux-standard-action)，還有以下兩項：  

* error
* meta

但是以上兩項是 optional 的，有需要可以參考文件說明   

所謂的 Action Type，就是一種分類，有了這個分類，提供給 Dispatcher 才可以知道後續的流程是什麼。  

至於 Payloads，其實就把它想做參數就簡單了   

其實意思就是說，你提供一組資料，告訴 Dispatcher，由他來分類給不同的方法來執行，Payloads 就是方法的參數  

就有點像是下面的樣子：  

```javascript
{
  type: 'ADD TODO'.
  payload" { text: 'new todo' }
}
```

但是因為有時候，我們的 Payload 會是畫面上的一些資料，為了要做到互動的效果，所以我們的 action 不一定會是靜態的 object。  
所以就有所謂的 `Action Creators`  

## Action Creators

這些 Action Creators 是用來產生 Action 的方法，一般都是簡單的方法，透過傳遞參數來變更 payload 的內容。  

```javascript
function addTodo(text) {
  return {
    type: ADD_TODO,
    payload: text
  };
}
```

在 Redux 裡，你只要回傳 action 物件就可以。  
所以測試就變得非常簡單，因為不會有什麼特別的方法是屬於 flux framework 的方法。  

## 實作

根據專案的結構，我們就在專案中建立一個 action 的目錄，然後把所有的 Action 都放在這邊  
所以我們就可以建立一個 `index.js` 在這邊  

以 redux news 的其中一個方法為範例：  

```javascript
export const REQUEST_ITEMTHREADS = 'REQUEST_ITEMTHREADS';
function requestItemThreads () {
  return {
    type: REQUEST_ITEMTHREADS, // must have type
    text: 'Requesting the top item threads'
  }
}
```

## 結語

Action 其實在 Flux 的流程裡面是一個很重要的項目，但是不管是什麼 Flux framework，這個部分也都有，所以，不太難理解。  
不過，因為 Redux 有一些方法可以做到 dispatch，在 Action 這邊也就變得很單純了～～～  
