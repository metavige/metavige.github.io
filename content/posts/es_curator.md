---
title: "ElasticSearch Curator"
date: 2016-11-18 13:34:30
tags:
- docker
- elasticsearch
slug: "es_curator"
---

[Curator](https://github.com/elastic/curator) 一個用來管理 ElasticSearch indices/snapshots 的工具

<!--more-->

之前有用這個來刪除 indices，但是因為之前用的指令比較簡單，都是統一刪除 21 天前的資料  
現在裡面資料比較複雜，所以需要做一些變化  
原本以為是不是下兩次指令就好，現在發現可以一次指定多個設定一次做～  

[參考文件 - Curator Guide](https://www.elastic.co/guide/en/elasticsearch/client/curator/current/about.html)

### CONFIG

連接 ElasticSearch 所需要的設定檔案，預設是應該放在 `~/.curator/curator.yml`

```yml
client:
  hosts:
    - es
  port: 9200
  url_prefix:
  use_ssl: False
  certificate:
  client_cert:
  client_key:
  ssl_no_validate: False
  http_auth:
  timeout: 30
  master_only: False

logging:
  loglevel: INFO
  logfile:
  logformat: default
  blacklist: ['elasticsearch', 'urllib3']
```

### Action

我這邊因為會有兩組 indices  
其中我想 topbeat 資料比較多，保留七天。  
packetbeat 資料比較少，可以保留久一點，所以我就分兩個 action 來設定

```yml
actions:
  1:
    action: delete_indices
    description: remove topbeat indices
    options:
      ignore_empty_list: True
      timeout_override:
      continue_if_exception: False
      disable_action:
    filters:
    - filtertype: pattern
      kind: prefix
      value: topbeat-
      exclude:
    - filtertype: age
      source: name
      direction: older
      timestring: '%Y.%m.%d'
      unit: days
      unit_count: 7
      exclude:
  2:
    action: delete_indices
    description: remove packetbeat indices
    options:
      ignore_empty_list: True
      timeout_override:
      continue_if_exception: False
      disable_action:
    filters:
    - filtertype: pattern
      kind: prefix
      value: packetbeat-
      exclude:
    - filtertype: age
      source: name
      direction: older
      timestring: '%Y.%m.%d'
      unit: days
      unit_count: 35
      exclude:
```

### 執行

接下來只需要執行下面指令就可以了～  

```bash
> curator action.yml
```

### Docker

我把專案放在 Github 上面: [elasticsearch-curator](https://github.com/metavige/elasticsearch-curator)


