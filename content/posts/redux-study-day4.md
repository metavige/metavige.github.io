---
title: "Redux Study Day4 - Store"
date: 2016-06-22 21:19:28
tags:
- javascript
- reactjs
- redux
categories:
- 程式開發
slug: "redux-study-day4"
---

* [Redux Study Day1 - Start]({{< relref "redux-study-day1" >}})
* [Redux Study Day2 - Action]({{< relref "redux-study-day2" >}})
* [Redux Study Day3 - Reducer]({{< relref "redux-study-day-3" >}})
* [Redux Study Day4 - Store]({{< relref "redux-study-day4" >}})

繼前面的 action/reducer 之後，接下來就是要把這兩者結合起來了～  

<!--more-->

## Store

當你寫完 action/reducer 之後，大概還不太能理解，這兩個東西要怎麼串在一起？  
**Store** 就是把 action/reducer 串在一起的物件

所以先來說說 **Store** 的責任： 

- 掌管應用程式狀態；
- 允許藉由 getState() 獲取 state；
- 允許藉由 dispatch(action) 來更新 state；
- 藉由 subscribe(listener) 註冊 listeners;
- 藉由 unsubscribe(listener) 回傳的 function 處理撤銷 listeners。 

![](https://facebook.github.io/flux/img/flux-simple-f8-diagram-explained-1300w.png)

根據上面的 Flux 架構圖，**action** 需要透過 **dispatcher** 來變更 **Store** 的狀態。  
所以，我們在寫完 **reducer** 之後，可以透過 [Redux][] 提供的 `createStore` 方法來把 **reducer** 放入 **Store** 中

```javascript
import { combineReducers, createStore } from 'redux'
let reducer = combineReducers({ visibilityFilter, todos })
let store = createStore(reducer)
```

## Dispatch Actions

當 Store 建立之後，你只要透過 `store.dispatch(action)` 的方式，就可以透過 **action** 來變更 **State**  了。  

```javascript
import { addTodo, completeTodo, setVisibilityFilter, VisibilityFilters } from './actions'

store.dispatch(addTodo('Learn about actions'))
store.dispatch(addTodo('Learn about reducers'))
store.dispatch(addTodo('Learn about store'))
store.dispatch(completeTodo(0))
store.dispatch(completeTodo(1))
store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED))
```

### 心得

因為 action/reducer 以及 **Store** 本身，都是單純的 javascript functions，所以在 UI 還沒有建立的時候，你其實可以透過 **Store** 的 subscribe/unsubscribe 方法，來觀察 **State** 物件的變化  
藉此來得知，action/reducer 的邏輯是否正確  

修改以下上面的程式碼：  

```javascript
import { addTodo, completeTodo, setVisibilityFilter, VisibilityFilters } from './actions'

// 訂閱每次的變更
let unsubscribe = store.subscribe(() => {
  console.log(store.getState());
});

store.dispatch(addTodo('Learn about actions'))
store.dispatch(addTodo('Learn about reducers'))
store.dispatch(addTodo('Learn about store'))
store.dispatch(completeTodo(0))
store.dispatch(completeTodo(1))
store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED))

// 取消訂閱
unsubscribe();
```
你就可以從 console 看到資料的變化 [(圖片來源)](https://chentsulin.github.io/redux/docs/basics/Store.html) ：

![](http://i.imgur.com/zMMtoMz.png)

  

[Redux]: https://github.com/reactjs/redux
