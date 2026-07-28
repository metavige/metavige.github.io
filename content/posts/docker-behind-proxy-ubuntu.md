---
title: "Docker service behind proxy - Ubuntu"
date: 2014-12-17 17:27:00
categories:
- 程式開發
tags:
- docker
slug: "docker-behind-proxy-ubuntu"
---

編輯 `/etc/default/docker`  
把以下 `export http_proxy` 的那一行 unmark, 然後改成你的 proxy 設定  

```bash
# Docker Upstart and SysVinit configuration file

# Customize location of Docker binary (especially for development testing).
#DOCKER="/usr/local/bin/docker"

# Use DOCKER_OPTS to modify the daemon startup options.
#DOCKER_OPTS="--dns 8.8.8.8 --dns 8.8.4.4"

# If you need Docker to use an HTTP proxy, it can also be specified here.
export http_proxy="http://127.0.0.1:3128/"

# This is also a handy place to tweak where Docker's temporary files go.
#export TMPDIR="/mnt/bigdrive/docker-tmp"
```

重新啟動 docker service --- ```service docker restart```

(如果你安裝的是 ubuntu 預設的 docker.io，指令就是 ```service docker.io restart```)
