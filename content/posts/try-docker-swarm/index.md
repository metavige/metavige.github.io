---
title: "Try Docker Swarm"
date: 2015-04-29 20:40:01
tags:

- docker
- mac

slug: "try-docker-swarm"
---

[Docker] 最近出了 1.6 版，[Docker Swarm] 也隨之更新了。

參考了以下的網站，自己嘗試做做看～
[原文連結](https://www.voxxed.com/blog/2015/04/clustering-using-docker-swarm-0-2-0/)

<!--more-->

![Docker Swarm 示意圖](http://blog.arungupta.me/wp-content/uploads/2015/04/docker-swarm-cluster.png)

## 開始

這邊實作的是與 docker-machine 結合的部分

- 先產生一個 token

```bash
$ docker run swarm create
c745d2d1bd2f65579e41f3808533da86
```

接下來複製上面產生的 Token，後面要用到

- 先建立 swarm-master

```bash
$ docker-machine create -d virtualbox --swarm --swarm-master --swarm-discovery token://c745d2d1bd2f65579e41f3808533da86 swarm-master
INFO[0000] Creating SSH key...
INFO[0000] Creating VirtualBox VM...
INFO[0010] Starting VirtualBox VM...
INFO[0010] Waiting for VM to start...
INFO[0087] "swarm-master" has been created and is now the active machine.
INFO[0087] To point your Docker client at it, run this in your shell: docker-machine env swarm-master | source
```

- 接下來分別建立 swarm-node01, swarm-node02

```bash
$  docker-machine create -d virtualbox --swarm --swarm-discovery token://c745d2d1bd2f65579e41f3808533da86 swarm-node-01
INFO[0000] Creating SSH key...
INFO[0000] Creating VirtualBox VM...
INFO[0010] Starting VirtualBox VM...
INFO[0011] Waiting for VM to start...
INFO[0073] "swarm-node-01" has been created and is now the active machine.
INFO[0073] To point your Docker client at it, run this in your shell: docker-machine env swarm-node-01 | source
```

```bash
$ docker-machine create -d virtualbox --swarm --swarm-discovery token://c745d2d1bd2f65579e41f3808533da86 swarm-node-02
INFO[0000] Creating SSH key...
INFO[0000] Creating VirtualBox VM...
INFO[0010] Starting VirtualBox VM...
INFO[0011] Waiting for VM to start...
INFO[0070] "swarm-node-02" has been created and is now the active machine.
INFO[0070] To point your Docker client at it, run this in your shell: docker-machine env swarm-node-02 | source
```

- 執行後的結果

```bash
$ docker-machine ls
NAME            ACTIVE   DRIVER       STATE     URL                         SWARM
swarm-master             virtualbox   Running   tcp://192.168.99.102:2376   swarm-master (master)
swarm-node-01            virtualbox   Running   tcp://192.168.99.103:2376   swarm-master
swarm-node-02   *        virtualbox   Running   tcp://192.168.99.104:2376   swarm-master
```

- 看一下 swarm-master 裡面，跑了什麼東西

如果發現，執行 `docker ps` 沒東西，表示你現在並非在 swarm-master
先執行一下 `docker-machine active swarm-master` 就可以

理論上，會有兩個 container 已經跑起來在 swarm-master，就是上面那張圖的 agent (紫色)

```bash
$ docker ps
CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS              PORTS                              NAMES
a53db3d5ffc4        swarm:latest        "/swarm join --addr    35 minutes ago      Up 16 minutes       2375/tcp                           swarm-agent
e98fbd194f54        swarm:latest        "/swarm manage --tls   35 minutes ago      Up 16 minutes       2375/tcp, 0.0.0.0:3376->3376/tcp   swarm-agent-master
```

- Swarm Cluster 的內容

先執行 `eval "$(docker-machine env --swarm swarm-master)"`
所以這邊就顯示了，我建立了兩個 node

```bash
$ docker info
Containers: 4
Strategy: spread
Filters: affinity, health, constraint, port, dependency
Nodes: 3
 swarm-master: 192.168.99.102:2376
  └ Containers: 2
  └ Reserved CPUs: 0 / 4
  └ Reserved Memory: 0 B / 1.025 GiB
 swarm-node-01: 192.168.99.103:2376
  └ Containers: 1
  └ Reserved CPUs: 0 / 4
  └ Reserved Memory: 0 B / 1.025 GiB
 swarm-node-02: 192.168.99.104:2376
  └ Containers: 1
  └ Reserved CPUs: 0 / 4
  └ Reserved Memory: 0 B / 1.025 GiB
```

- 可以用下面的指令列出 swarm 的 node，如果你有建立兩個以上的 swarm-master，用的是你建立 swarm-master 的 token 來區分

```bash
$ docker run swarm list token://c745d2d1bd2f65579e41f3808533da86
192.168.99.104:2376
192.168.99.102:2376
192.168.99.103:2376
```

> 2015-05-02 更新，我之前因為使用 token 是用原文的範例指令直接執行，所以，註冊 Swarm 的時候，會與原本註冊的資料重複，如果自己產生一組 Token 就不會這樣了～

## 後記

其實我現在對 [Docker Swarm] 的了解還沒有很深入，只是先照著文章的步驟做出來而已，還在想這個可以應用在哪邊，之後如果有想到或嘗試什麼新的東西，會在寫下來

在我嘗試這篇文章的步驟時，出現了一個意料之外的狀況，就是我先把我本機的 docker 升級到 1.6，結果我建立出來的 virtualbox image 卻不是這個版本，所以就噴出了以下的錯誤：

```bash
FATA[0000] Error response from daemon: client and server don't have same version (client : 1.18, server: 1.17)
```

如果遇到這個狀況，只需要升級 swarm-master 的 boot2docker 版本就可以。
這時候就會覺得 docker-machine 很好用 .....

```bash
docker-machine upgrade swarm-master
```

然後等它做完，重新啟動 docker-machine 就好～ (建議是要重新啟動，因為我不重新啟動就不能用～)

[docker swarm]: https://docs.docker.com/swarm/
[docker]: https://www.docker.com
[fish]: http://fishshell.com
