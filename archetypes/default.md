---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
# permalink 規則是 /:year/:month/:day/:slug/，
# 少了 slug 會改用標題去產生網址，中文標題會變成不好看的編碼字串。
slug: "{{ .File.ContentBaseName }}"
tags:
categories:
draft: true
---
