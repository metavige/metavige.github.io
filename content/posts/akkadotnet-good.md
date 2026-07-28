---
title: "Akka.Net 不錯用"
date: 2017-02-13 00:00:00
categories:
- 程式開發
tags:
- dotnet
slug: "akkadotnet-good"
---

真的使用之後，越來越覺得 Actor Model 是個好物，因為他本來就是拿來做平行運算用的。

建議可以先從以下的幾篇文章以及 Github 的範例開始

- [Akka.Net Application Architecture and Design](https://petabridge.com/training/akka-design-patterns/)
- [Building Networked .NET Applications with Akka.Remote](https://petabridge.com/training/akka-remoting/)
- [.NET Distributed Systems Architecture and Design with Akka.Cluster](https://petabridge.com/training/akka-clustering/)

## 好處

我剛開始做的時候，其實是想到 Sequence Diagram。因為 Actor Model 的重點其實就是在訊息的傳遞與處理，只是在整體架構上有一個 ActorSystem 幫忙做處理

根據以下的圖片

![](http://getakka.net/docs/images/actor.png)

一個 Actor 在建立之後，[AkkaDotNet][] 會幫你建立整個 Actor 的基本行為。
包含一個 Mailbox、預設的狀態等，而且也預設了每個 Actor 都有可以有 Children Actors
所以，當你傳遞一個訊息給 Actor 的時候，其實不是直接呼叫 Actor 中處理訊息的方法，而是先進入 Mailbox，類似郵件的方式排隊處理。

當處理有問題的時候，你是可以在 Handle 方法中，直接拋出錯誤，讓 Actor 失敗。如此一來就會觸發上層 Actor 的 SupervisorStrategy。預設的 Strategy 可以參考 [Fault Tolerance](http://getakka.net/docs/Fault%20tolerance) 文件


以下是本機範例

```csharp
// Create a new actor system (a container for your actors)
var system = ActorSystem.Create("MySystem");

// Create your actor and get a reference to it.
// This will be an "ActorRef", which is not a
// reference to the actual actor instance
// but rather a client or proxy to it.
var greeter = system.ActorOf<GreetingActor>("greeter");

// Send a message to the actor
greeter.Tell(new Greet("World"));

// This prevents the app from exiting
// before the async work is done
Console.ReadLine();
```

## Akka.Remote

你寫好了 Actor，也在同一個系統中跑完所有的流程，如果你需要做分散 Loading 的動作，不需要你把程式碼呼叫的部分再大改。

你只需要改變取得 Actor 的路徑。

是的，路徑！

預設取得 Actor 的路徑是用 actor name 來取得，取回來之後基本上就是一個 IActorRef 類別的物件(可以參考上面的範例)

當你需要取得遠端的 ActorRef 時，你只需要修改設定(當然要加上 Akka.Remote 套件)

```
akka {
    actor {
        provider = "Akka.Remote.RemoteActorRefProvider, Akka.Remote"
    }

    remote {
        helios.tcp {
            port = 8080
            hostname = localhost
        }
    }
}
```

然後修改你取得 Actor 的『路徑』就可以。就好像訪問 HTTP 一樣的路徑～

![](http://getakka.net/docs/remoting/images/remote-address-annotation.png)

像上面的本機範例，取得 Actor 的路徑改一下就可以

```csharp
var greeter = system.ActorOf<GreetingActor>("akka.tcp://MySystem@localhost:8080/user/greeter");
```

## Akka.Cluster

當你的系統越來越大，需要擴充的時候，可以參考使用 Akka.Cluster
一樣不太需要調整太多程式，只需要加上 Akka.Cluster 套件使用以及設定調整
主體處理邏輯應該都不需要調整太多(除非你寫的太爛～)

Akka.Cluster 與 Akka.Remote 不太一樣的是，多出了 High Availability 的管理。
主要是針對每個 Actor System Node 間的互相認知通訊，以及其他管理節點的功能
但是因為我還沒用到，詳細的東西我不太清楚


## 參考

- [getakkanet](http://getakka.net)
- [官方文件](http://getakka.net/docs/) - 必看！

[AkkaDotNet]: http://getakka.net
