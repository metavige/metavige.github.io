---
title: "Docker Live Migration"
date: 2016-11-11 13:13:12
categories:
- 程式開發
tags:
- docker
slug: "Migration"
---

<iframe src="//www.slideshare.net/slideshow/embed_code/key/GvdO7izO4dp714" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/PhilEstes/live-container-migration-openstack-summit-barcelona-2016" title="Live Container Migration: OpenStack Summit Barcelona 2016" target="_blank">Live Container Migration: OpenStack Summit Barcelona 2016</a> </strong> from <strong><a target="_blank" href="//www.slideshare.net/PhilEstes">Phil Estes</a></strong> </div>

<!--more-->

簡單列一下我聽到的重點

- Linux Kernel 3.11 才支援
- 透過一個叫做 CRIU 的技術達成
  - 參考網站: [CRIU](https://criu.org/)
- Docker 1.13 experimental build 支援
- 有兩個層面
  - In-Memory Change
	- In-Memory + Filesystem Change
- 透過 checkpoint 的方式，將變更記錄下來，我猜測是以版本控管的方式 push 相關的 metadata
- 在新的機器上，可以透過 pull 方式 merge 新的 metadata 變更，然後繼續往下執行

如果這個技術真的可以達到，那其實真的要把 VM 幹掉很快～
