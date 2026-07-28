---
title: Sentry 10 onpremise installation
date: 2020-05-13 09:18:07
tags:
- devops
- sentry
slug: "sentry10-installiation"
---

Log 紀錄，在 DevOps 的情境中，其實是一個很重要的項目，所有的系統在上線的時候，都應該要有適當的 Log 紀錄  
以方便後續的問題追蹤，尤其是在 Microservice 的設計上面  

當你的服務或系統是以 `docker` container 的方式啟動，如果只是以 container stdout/stderr 的方式來取得紀錄，實際上後續的追蹤並不容易，所以我自己找了一下網路上的解決方案，找到了 [sentry](https://sentry.io/) 的這套系統。

而在公司內部使用，如果公司環境並不允許 Log 紀錄在外部的網站，就需要考慮 Self-Hosted 的建置，剛好 sentry 有提供 onpremise 的部分，就找了這個 source 來驗證一下在本地端建置 sentry 的步驟。

<!--more-->

## Self-Hosted 下載

- 根據官方網站的說明，需要先下載 [onpremise](https://github.com/getsentry/onpremise) 的原始碼。  
- 需要先安裝好 `docker` 跟 `docker-compose`，版本號可以參考原始碼中的 `README.md`

## 建置 onpremise

- 前置作業，其實是會先根據下載的原始碼，去 build sentry 的 image 出來
- 可以直接執行 `./install.sh`，來直接建置 onpremise 的 image。不過如果要指定 sentry 版本的話，可以先設定好環境變數 `SENTRY_IMAGE=getsentry/sentry:10` 的方式，來建置 sentry v10 的 image。
- 如果直接執行 `./install.sh`，會將 `sentry` 目錄下的 `config.example.yml` 以及 `sentry.conf.example.py` 複製成 `config.yml` 以及 `sentry.conf.py` 兩個檔案，並且開始建置 onpremise sentry image
- 建置完成之後，到最後一步，只要出現下面的訊息，就表示可以啟動 sentry 來使用了！

```
....
Cleaning up...

----------------
You're all done! Run the following command to get Sentry running:

  docker-compose up -d
```

## 修改設定

因為是使用 `docker` 來啟動 sentry，所以需要修改 sentry 的 `SENTRY_DISALLOWED_IPS` 設定  

下面是預設的設定值，需要將下面的設定，複製到 `sentry/sentry.conf.py` 檔案中，並且調整 `docker` 內的 IP 區段，讓 sentry 可以執行，否則會有 502 的錯誤。

```python
SENTRY_DISALLOWED_IPS = (
    '0.0.0.0/8',
    '10.0.0.0/8',
    '100.64.0.0/10',
    '127.0.0.0/8',
    '169.254.0.0/16',
    '172.16.0.0/12',
    '192.0.0.0/29',
    '192.0.2.0/24',
    '192.88.99.0/24',
    '192.168.0.0/16',
    '198.18.0.0/15',
    '198.51.100.0/24',
    '224.0.0.0/4',
    '240.0.0.0/4',
    '255.255.255.255/32'
)
```

`docker` 本身的網路區段，可以到 docker for desktop 的 Resource > Network 設定中去看，就可以知道。

我自己的設定是 `192.168.65.0/24`，所以我的設定方式如下：

```python
SENTRY_DISALLOWED_IPS = (
    '0.0.0.0/8',
    '10.0.0.0/8',
    '100.64.0.0/10',
    '127.0.0.0/8',
    '169.254.0.0/16',
    '172.16.0.0/12',
    # '192.0.0.0/29',
    '192.0.2.0/24',
    '192.88.99.0/24',
    '192.168.0.0/16',
    '198.18.0.0/15',
    '198.51.100.0/24',
    '224.0.0.0/4',
    '240.0.0.0/4',
    '255.255.255.255/32'
)
```

如果日後在內部網路使用，就需要視情況調整設定。

## Issue

在我實際測試建置的這個時間，實際上如果用 `SENTRY_IMAGE=getsentry/sentry:10 ./install.sh` 的方式建置 sentry，最後面會出現一個錯誤：

```
...
Creating sentry_onpremise_postgres_1                ... done
upgrade: 1: exec: /etc/sentry/docker-entrypoint.sh: not found
Cleaning up...
```

這個問題，在我測試的時候，還是有 open issues 未解決：

- https://github.com/getsentry/onpremise/issues/384
- https://github.com/getsentry/onpremise/issues/412

> 就算不設定 SENTRY_IMAGE，我還是有發現錯誤，所以我就沒有使用最新版本來測試。

後來，去追蹤了一下問題點，發現在 `getsentry/sentry:10` 的 image 中，實際上面 `/etc/sentry/docker-entrypoint.sh` 是存在的，可是，在 `docker-compose.yml` 內卻設定了一個 volume 去指向目前本地端的 `sentry` 目錄。  
導致這個檔案就直接被移除了，之後在建置的階段，就會發生錯誤  

後來我自己從 `getsentry/sentry:10` 的 image 先把這個檔案，複製到本地端的 `sentry` 目錄，讓他 mount 到 container 內還是可以找到這個檔案，就解決了安裝問題。

## License

https://blog.sentry.io/2019/11/06/relicensing-sentry

目前 sentry 的 License，是使用 `BSL`，因為只是在公司內部使用，應該不會有授權問題 (只要你不是要拿 sentry 延伸的產品來賣)  