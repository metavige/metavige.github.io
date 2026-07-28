---
title: "Backbone Study"
date: 2013-02-13 11:52:00
categories:
- 程式開發
tags:
- javascript
- backbonejs
slug: "backbone-study"
---

在學習 Backbone 的時候，針對 Backbone 比較重要的一些事件、方法與屬性作個記錄  

[Backbonejs](http://backbonejs.org/)

<!--more-->

## 事件
- on/bind 設定事件
- off/unbind 移除事件
- trigger 觸發事件
- once 設定一個只執行一次的事件
- listenTo 監聽其他物件的事件
- stopListening 移除監聽其他物件的事件

## Model

這邊主要要設定的是資料結構，就是 Model 裡面有哪些屬性可以使用  

```javascript
 var MyModel = Backbone.Model.extend({
      // 屬性～～～或其他的方法
 });
```

這邊回傳的會是一個 Function Object 是可以被 new 的～  

- `set(attributes, [options])`
會觸發 change 事件。  
change 事件可以指定特定的 attribute，如 change:name 事件，表示 name attribute 變更會觸發  
但是一定是要用 set 方法才可以～  
如果有設定 validate 方法，就會驗證過才存入資料，驗證失敗不會觸發事件。可在 options 傳遞 error callback  

- `unset(attribute, [options])` - 移除屬性，也會觸發 change 事件，除非 options 傳遞 { silent: true }  
clear 清除所有屬性  

- `changed` 屬性 - 物件是否有變更～？  

- `fetch(options)` - 與 store 同步，會用 Backbone.sync 中的 read  
HTTP GET -
options - 成功或失敗的 callback, 或其他 Ajax 參數  
如果 server 端資料與本地不同，觸發 change 事件  

- `save()` 存檔，會作 sync  
如果 isNew - HTTP POST, or HTTP PUT  

- `destroy` - HTTP DELETE
{ wait: true } - 這樣會讓這個方法等到執行完畢有回應才結束  

- `url()` - 預設是 collection.url/id，也可以是 urlRoot/id  
- `urlRoot` - 自行設定 url  


## Collections  

Collections 本身最常用到的應該只是 fetch，如果要讀取 server 端資料  
不會有更新的動作，每個更新的動作都是透過 Model 的 sync 方式～  
所以應該著重在事件觸發的點，以及 fetch 方法  


```javascript
 var MyCollection = Backbone.Collection.extend({
      // 屬性～～～或其他的方法
 });
```


- `url` - sync url  

- `fetch` - sync read  
可以傳遞其他參數給後端 ex: { data : { page : 5 } }  

## View

展現畫面，重要的是 render 方法，用來展現畫面用～  

```javascript
 var MyView = Backbone.View.extend({
      // 屬性～～～或其他的方法
      render: function() {
        // render DOM, page
      }
 });
```


- `initialize` 方法
初始化，應該會拿來作 view 的事件指定～  

- `render` 方法
修改 el 物件內容，達到畫面變更～  
這個方法最好回傳 this  

- `el` 物件 : DOM
可以在 View 初始化的時候，用 tagName, className, id 或其他參數來指定  
預設為 div 空白的～  

- `$el` - cached jQuery(Zepto) 物件  
就是 View 這個物件本身在畫面上對應的 jQuery 物件  
透過這個屬性可以用 jQuery 的方法來操作 DOM Object  

- `$( )` 方法，delegate $, query object inside View  
