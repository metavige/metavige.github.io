title: "Entity Framework FakeDbSet"
date: 2015-03-25 11:56:15
categories:
- 程式開發
tags:
- csharp
- EntityFramework
---

為了單元測試，需要作假資料，如果用資料庫來做，就需要考慮測試資料的建立以及 Transaction 的問題，因為建立測試資料後還得刪除。

所以可以使用 Mock 的方式，把 *IDbSet* 改成使用 InMemory

目前 [Nuget.org]() 就有一個套件，可以幫忙你實作 *InMemorySet*
我目前是安裝 [AnotherFakeDbSet](https://www.nuget.org/packages/AnotherFakeDbSet/)，Source 在 [Github-AnotherFakeDbSet](https://github.com/realistschuckle/FakeDbSet)

這個 Source 的原始版本是 [FakeDbSet](https://github.com/a-h/FakeDbSet)
不過我也覺得 [AnotherFakeDbSet](https://www.nuget.org/packages/AnotherFakeDbSet/) 改的不錯，而且因為陸續有推出新版本，所以我自己也是採用這個 Nuget Package


<!--more-->


設定 `DbContext` 的方式，是可以參考他 Source 裡面的 Examples 專案 (所以這邊就不把程式碼貼出來了，可以到 [AnotherFakeDbSet](https://www.nuget.org/packages/AnotherFakeDbSet/) 去下載)


在自己程式裡面，要使用 `DbContext` 的時候，就不能像是以下的程式一樣直接使用，因為這樣就無法測試了

```csharp
using(var context = new BookStoreEntities()) {
  // Code....
}
```

我自己的方式，是採用類似 `Provider` 的概念來做。

{% gist 8d1c580a1cdf96a4bddd %}

這樣子，你如果測試的時候要抽換就會變得很容易
（當然，如果你要使用類似 IoC 的 framework 實作也 OK~）
