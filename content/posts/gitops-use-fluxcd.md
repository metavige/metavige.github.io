---
title: "GitOps - use fluxcd"
date: 2019-12-16 12:00:00
categories:
- 程式開發
tags:
- docker
- kubernetes
- devops
slug: "gitops-use-fluxcd"
---

[https://fluxcd.io/]()

> Flux 目前是 CNCF 的 Sandbox 項目 (2019.08.20)

![](https://rammusxu.github.io/2019/07/03/gitops-flux-note/flux-flow.png)

圖片出處: https://rammusxu.github.io/2019/07/03/gitops-flux-note/flux-flow.png

<!--more-->

## 概念

* 原始碼專案透過 CI 方式，建置好 Image，並且發佈到 Docker Registry
* 另外有一個 Git Repository，專門存放所有的 kubernetes 設定檔案
* 由 Flux CD 去監聽 Docker Registry 以及 Git Repository 的變化
    * 監聽的 docker image 有新的 tag，可以同步變更 yml 內 tag 資訊 (git push)，以及變更 kubernetes 內的設定。
    *  Git Repository 的設定變更，也會同步 kubernetes 的設定。

## 前置作業

### 安裝 fluxctl

參考 https://docs.fluxcd.io/en/stable/references/fluxctl.html

### 準備好一個 Git Repository

準備一個簡單的 repository，存放要設定的 yml

如果使用的是公司內部的 git repository，需要先參考 https://docs.fluxcd.io/en/stable/guides/use-private-git-host.html 的設定，將 known_hosts 設定到 Pod 內的 `~/.ssh/known_hosts` 檔案內，不然會無法連線。下方安裝步驟有說明。

Git Repository 內可以有目錄的規劃，管理不同種類的設定，fluxcd 會掃描子目錄內的變更。

### 設定連線到 kubernetes

執行 `fluxctl` 的這台機器，需要可以使用 `kubectl` 指令。

但是這並非必要，因為可以將 `fluxctl` 產生出來的檔案，另外透過其他方式做 apply 的動作。

但是如果需要執行 `fluxctl` 其他指令，還是需要能連線到 kubernetes。

## Flux 安裝步驟

### 建立一個 namespace

官方文件建議，建立一個 namespace 放 `flux` 的資源 (namespace 的規劃沒有特定，但將資源放在一起會比較好管理)

```
$ kubectl create namespace flux
```

> 請注意，下方所有的設定都會是需要建立在這邊所建立的 namespace 中，如果這邊的 namespace 名稱有改變，記得改變下方的所有設定的 namespace

### 利用 fluxctl 產生 k8s 部署檔案

```
$ fluxctl install \
  --git-user={} \
  --git-email={} \
  --git-url={} \
  --git-path={} \
  --name flux > fluxcd.yml
```

上方的 git-user, git-email, git-url, git-path 是需要參考實際上 git 的位置與設定做調整，下方說明一下各自的意思

* git-user: 登入 git 的使用者帳號
* git-email: 登入 git 的使用者電子郵件
* git-url: git repostitory 的位置
* git-path: 在 git repository 中，要檢查 yml 的目錄位置

官方文件是直接做 `kubectl apply`，但為了下面的步驟，建議將輸出導出成檔案，方便修改。

### 修改 fluxcd.yml 的 namespace (Optional)

如果第一個步驟建立的 namespace 並非 flux，記得要改變 `fluxcd.yml` 內的 namespace 設定

### 準備 known_hosts (針對 SSH 連線要使用)

透過 `ssh-keyscan` 指令，用來取得 ssh server 的公鑰，這個動作，是要把這組公鑰，放在 fluxcd 的 POD 中的 `~/.ssh/know_hosts` 檔案內，讓 fluxcd 的 POD 可以透過 ssh 連線到 git 的服務器。

參考 https://docs.fluxcd.io/en/stable/guides/use-private-git-host.html   

為了要放到 kubernetes 去，參考了 flux 的文件，產生下方的 `flux-ssh.config.yml`

```
apiVersion: v1
data:
  known_hosts: |
    [這邊放 ssh-keyscan 產生的內容]
kind: ConfigMap
metadata:
  name: flux-ssh-config
  namespace: flux
```

name 是參考 `fluxcd.yml` 中的定義，namespace 參考上方設定

### 為了 SSH 設定，修改 fluxcd.yml (請注意 yml 的縮排)

找到下方的設定，取消掉註解 。這個設定會在 Deployment 的 `spec/template/spec/volumes` 內

```
# The following volume is for using a customised known_hosts¬
# file, which you will need to do if you host your own git¬
# repo rather than using github or the like. You'll also need to¬
# mount it into the container, below. See¬
# https://docs.fluxcd.io/en/latest/guides/use-private-git-host.html
- name: ssh-config
  configMap:¬
    name: flux-ssh-config
```

接下來，找到 Deployment 內的 `spec/template/spec/container/volumeMounts` 內的設定，取消註解

```
# Include this if you need to mount a customised known_hosts¬
# file; you'll also need the volume declared above.¬
- name: ssh-config¬
  mountPath: /root/.ssh
```

### 增加 insecure-registry 設定，修改 fluxcd.yml (請注意 yml 的縮排)

一般在公司內部提供的 Private Registry 通常都是走 HTTP 協定，所以需要設定 insecure-registry 讓 flux 可以取得 private registry metadata，下方的設定需要設定在 Deployment 內的 `spec/template/spec/container/args` 內

> 這段是要自行加入的，沒有原始的設定可以取消註解

```
# setup insecury-registry¬
- --registry-insecure-host=private.registry.xxxx
```

上方的設定，參考 https://docs.fluxcd.io/en/stable/references/daemon.html 內的參數說明來調整

### 啟動 fluxcd

將上面設定的兩個檔案，`flux-ssh.config.yml` 以及 `fluxcd.yml`，透過 `kubectl` 將設定建立起來 
(或透過 kubenetes dashboard 設定)。

### 註冊 Git user SSH Key

預設建立好 `fluxcd` 之後，可以透過 `fluxctl identity` 指令，取得在 `fluxcd` POD 內產生的 Public Key，然後設定到 Git 使用者的 SSH 金鑰內，讓 `fluxcd` 可以存取 Git Repository。


> 這邊建立的 ssh public/private key，會存放到 kubernetes volume內，如果有重新建立 fluxcd 的動作，並不需要重新設定 git user ssh key。


目前設定 Git 的存取，也可以事先產生好 SSH Key，可以參考 https://docs.fluxcd.io/en/stable/guides/provide-own-ssh-key.html

### 啟動 yml 內的自動處理機制

如果要讓 fluxcd 自動化的偵測 Docker Repository 變更，並且同步修改 Git 的設定，需要在 YML 內加入下面的 annotations 才可以：

```
  annotations:
    fluxcd.io/automated: 'true'
```

透過上方的設定， flux 會檢查目前要部署的 Image 中是否有新的 Tag，如果有，就會同時間修改 YML 以及 kubernetes 的設定，並且同步推送變更到 Git 去


## 跟 Flux 相關的一些注意事項

### 存取 private registry

一般如果需要存取 Docker Private Registry，通常會在 Docker Host 內設定 insecure-registry，但是初步設定 flux 時，發現無法讀取 docker daemon.json 內 insecure-registry 的設定

基本上是可以透過設定 `--registry-insecure-host` 來達到檢查 Private Registry 的功能。不過如果 Private Regsitry 有設定權限，可能需要參考參考 https://github.com/fluxcd/flux/pull/1314 來設定 (目前沒有測試)

### Git

目前 Flux 的機制，是透過偵測 Git Repository 以及 Docker Registry 變更，來做到 Continuous Delivery 的機制，但是目前預設只會做到 Create/Update 的動作，如果開發者刪除了 Git Repository 內的設定，並不會刪除 kubernetes 內已經建立好的設定。

如果有需要做到刪除異動的變更處理，可能需要設定 `—sync-garbage-collection`，但預設的作法會是保守的，因為通常裡面不會只有由 `flux` 建立的資源。

### 影響變更時間

基本上，這邊的影響變更時間受到幾個時間影響，一個是掃描 GIT 的時間，一個是掃描 Docker Registry 的時間。

目前內部預設的掃描時間，都是五分鐘，其中影響的參數有兩個，一個是 `—sync-interval` (控制同步設定到 kubernetes 的頻率)，一個是 `—git-poll-interval` (查詢 git 新的 commit 的頻率)。

參考 https://docs.fluxcd.io/en/stable/faq.html ，建議如果要較快速的影響變更，調整 `—git-poll-interval` 會比較好。

## 參考

* https://www.weave.works/technologies/gitops/
* https://github.com/fluxcd/flux
* https://docs.fluxcd.io/en/stable/
* https://www.servicemesher.com/blog/flux-get-start-easy/



