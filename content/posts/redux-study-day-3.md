---
title: "Redux Study Day3 - Reducer"
date: 2016-06-21 20:21:39
tags:
- javascript
- reactjs
- redux
categories:
- 程式開發
slug: "redux-study-day-3"
---

* [Redux Study Day1 - Start]({{< relref "redux-study-day1" >}})
* [Redux Study Day2 - Action]({{< relref "redux-study-day2" >}})
* [Redux Study Day3 - Reducer]({{< relref "redux-study-day-3" >}})
* [Redux Study Day4 - Store]({{< relref "redux-study-day4" >}})

隔了半年多，重新真的找一個專案來實作 [Redux][]，不得不說，半年的變化  
跟我當初看 [Redux][] 差異還是蠻大的。當然，觀念什麼的是差不多，只是可能很多程式碼會有所調整  

這次重新再開始，之前兩天的東西，找時間修改。今天就從 [Redux][] 核心的 Reducer 開始好了～
 
<!--more-->

我一剛開始看到 **Reducer**，其實並沒有想到 Map/Reduce，不過慢慢的真的深入瞭解以及自己去寫了程式之後，感覺這個 **Reducer** 的確有點 Map/Reduce 的味道

在談到 Reducer 之前，大多數的文件會先說：『你要先確定 **State** 的 “形狀”』，英文就是 "State's Shape"  

為什麼要這樣說呢？我後來自己實作之後才知道，這跟 [Redux][] 的三大原則有關係：  

## [Redux][] 的三大原則

1. **唯一真相來源**: 整個應用程式的 state，被儲存在一個樹狀物件放在唯一的 store 裡面。
2. **State 是唯讀的**: 改變 state 的唯一的方式是發出一個 action，也就是一個描述發生什麼事的物件。
3. **變更被寫成 pure functions**: 要指定 state tree 如何藉由 actions 來轉變，你必須撰寫 pure reducers。

根據這三個原則，我的理解是，當你需要有任何變更 **State** 的動作時，都需要發送一個
 action。  
而發送 action 之後，需要透過 **Reducer** 來變更 **State**。  
但是這邊所謂的『變更』，並不是直接去修改 State 物件 (因為第二個原則)，而是透過一個 pure functions 來結合舊的 **State** 以及 action 所傳入的 payload 資料，來產生一個新的 State。  

## Pure functions - Reducer

為什麼要強調所謂的 **Pure functions**？  
這是為了所謂的測試性。(如果你聽得懂簡單的英文的話，我建議你看一次[這段影片](https://egghead.io/lessons/javascript-redux-the-reducer-function?course=getting-started-with-redux))  

當你呼叫這個 pure functions 的時候，每次呼叫都可以得到一定的結果，不會因為上下文而改變，這樣的話，你就可以撰寫單元測試的程式來測試它  


### 非 pure functions  

```javascript
var a = 0;
function add (i) {
  return i++;
}
```

像是上面這個方法，就不是 **pure functions**，因為它有改變到 i 這個資料  
你如果再呼叫一次，結果會與上次的結果不同  

```
console.log(add(a)) // 0;
console.log(add(a)) // 1;
```

### pure functions

```javascript
var a = 0;
function add (i) {
  return i+1;
}
```

但如果是上面的寫法，每次呼叫結果都會是 `1`，這就表示你寫的程式是可以被預測的！  
當然之後還可以延伸有其他做法...... 這屬於進階用法，以後再討論～  

## State 的 Mapping

基本上透過 [Redux][] 設定進去的所有 reducer functions，在每次 action 被 dispath 的時候，會呼叫註冊的所有 **Reducer**，你只需要透過判斷 `action.type` 來決定你是否要處理這個 action  


```javascript
function (state, action) {
  switch (action.type) {
    case 'ACTION':
    	return { ... }; // 回傳新狀態物件
    default:
    	return state;
  }
}
```
如果你並不要處理這個 `action`，你必須要回傳原本的 `state` 物件，以保持原先的狀態不改變。   

當你的 `state` 物件的屬性如下：  

```
{
  visibilityFilter: '',
  todos: []
}
```

你可以寫一個 **Reducer** 來處理這全部的狀態，但是，也可以透過 `combineReducer` 的方法，寫兩個 pure functions 來分別處理不同的 `state properties`
  
  
```javascript  
function visibilityFilter(state = 'SHOW_ALL', action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case 'COMPLETE_TODO':
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: true
          })
        }
        return todo
      })
    default:
      return state
  }
}

import { combineReducers, createStore } from 'redux'
let reducer = combineReducers({ visibilityFilter, todos })
let store = createStore(reducer)
```

## 心得

**Reducer** 這個方法，其實要多寫寫才會比較清楚，而且當你的 State 物件 **『形狀』** 越來越清楚的時候，你才會對 **Reducer** 比較有感覺   

所以剛開始寫的時候，我會建議一次寫一組 action/reducer，都測試確認之後，透過 `createStore` 串起來測試一遍，比較能夠理解  

---

[Redux]: https://github.com/reactjs/redux
