title: "Unity + SharpRepository"
date: 2013-11-19 15:38:00
categories:
- 程式開發
tags:
- csharp
- dotnet
- IoC
---

最近在學習使用 [SharpRepository](https://github.com/SharpRepository/SharpRepository)，剛好專案中有使用 IoC Container - Unity, 所以需要把兩者做一個結合

<!--more-->

不過，實際使用了 `SharpRepository.Ioc.Unity` 這個 Package，卻發現這個專案並沒實作到與 Unity 結合的部分，實際看了一下程式碼，才發現作者做了以下的註解：

> using InjectionFactory I can get access to the container but I don't seem to ahve access to a context
> in the other Ioc's there is a context where I can get access to the type being resolved and get the generic arguments which is what i need

所以實際上裡面的程式碼直接就拋出 `NotImplementedException`

後來經過幾番確認與測試，最後終於找到方式了～
程式碼如下：

```csharp
var RepositoryConfigurationName = "repository";
// 結合 SharpRepository 與 Unity
RepositoryDependencyResolver.SetDependencyResolver(new UnityDependencyResolver(Container));
Container.RegisterType(typeof(IRepository<>),
  new PerResolveLifetimeManager(),
  new InjectionFactory((c, t, n) =>
  {
    var genericParams = t.GetGenericArguments();
    return RepositoryFactory.GetInstance(genericParams[0], RepositoryConfigurationName);
  }));
Container.RegisterType(typeof(IRepository<,>),
  new PerResolveLifetimeManager(),
  new InjectionFactory((c, t, n) =>
  {
    var genericParams = t.GetGenericArguments();
    return RepositoryFactory.GetInstance(genericParams[0], genericParams[1], RepositoryConfigurationName);
  }));

// 20140716 補充多主鍵的 Repository
Container.RegisterType(typeof(ICompoundKeyRepository<,,>),
  new PerResolveLifetimeManager(),
  new InjectionFactory((c, t, n) =>
  {
    var genericParams = t.GetGenericArguments();
    return RepositoryFactory.GetInstance(genericParams[0], genericParams[1], genericParams[2], RepositoryConfigurationName);
  }));
```

重點就在註冊 Type 的類型上面，如果只有 IRepository<> 表示是單一的 Generic Type Argument，如果是 IRepository<,> 就表示有兩個 Generic Type Arguments~

老實說，真的很少人知道 C# 的 Generic Type 是這樣的～～～
