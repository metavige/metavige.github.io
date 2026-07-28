---
title: "Ceph RBD 使用"
date: 2016-09-05 17:29:00
tags:
- linux
- ceph
slug: "ceph-rbd"
---

簡單記錄一下 Ceph RBD 使用的紀錄 --->

<!-- more -->

#### 先安裝 ceph-common  

```
apt-get install ceph-common
```

目前在 ubuntu trusty 內安裝的版本是    

```
$ rbd -v
ceph version 0.80.11 (8424145d49264624a3b0a204aedb127835161070)
```


#### 建立 Image 動作 (假設 image name 是 test):  

```
sudo rbd create --size <MB> test
```


##### Mapping 到 dev

```
sudo rbd map test
```

> 這邊預設會把 image mapping 到 /dev/rbd/rbd 下面，名稱就是 image name  
> 所以會放在 /dev/rbd/rbd/test  

#### 格式化:  

```
sudo mkfs.xfs -f /dev/rbd/rbd/test
```

> 我用 xfs 的原因是因為未來如果要擴充的話，比較方便
> 可以用 xfs_growfs 指令來擴充

#### 掛載目錄

```
$ sudo mkdir -p /mnt/test
$ sudo mount -o nouuid -t xfs /dev/rbd/rbd/test /mnt/test  
```

> 用 -o nouuid 的參數主要是，如果你建立過一次，沒下這個參數
> OS 會把 uuid 建立起來，這樣沒辦法反覆 map/unmap (如果你有這個需求的話，像我測試就會)

#### 卸載

```
$ sudo unmount /mnt/test
$ sudo rbd unmap /dev/rbd/rbd/test
```


