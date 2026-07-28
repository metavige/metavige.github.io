---
title: "Nginx 透過 HTTP Method 來做 Proxy Pass"
date: 2015-11-13 14:36:41
tags:
- nginx
slug: "nginx-proxy-pass-by-http-method"
---

## 目的

開發一套系統，把資料處理 (POST/PUT/DELETE) 與查詢 (GET) 的功能分開做  
變成提供兩套服務，但對 Client 來說，還是需要整合成相同的 Uri  
所以就透過 Nginx 來做到前端介面的整合  

<!--more-->
## 範例

```
location / {
    if ($request_method !~* GET) {
        # For Write Requests
        proxy_pass http://writers;
    }
    # For Read Requests
    proxy_pass http://readers;}
```

## 結語

雖然說，Nginx 其實並不希望你使用 if ([If Is Eval](https://www.nginx.com/resources/wiki/start/topics/depth/ifisevil/))，不過對工程師來說，能簡單的做到效果是最重要的！！！     

## Reference

Stackoverflow: [nginx proxy_pass based on whether request method is POST, PUT or DELETE](http://stackoverflow.com/questions/8591600/nginx-proxy-pass-based-on-whether-request-method-is-post-put-or-delete)