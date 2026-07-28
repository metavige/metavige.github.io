---
title: "Docker 的反模式"
date: 2019-12-10 19:00:00
categories:
- 程式開發
tags:
- docker
slug: "docker-anti-patterns"
---

針對網路上面的文章，加上自己的解釋，說明如何避免做到 Docker 的反模式

原始文章: [Docker Anti-Pattern](https://medium.com/containers-101/docker-anti-patterns-ad2a1fcd5ce1)

<!--more-->

## 反模式 1: 將 Docker 視為虛擬機器 (VM)

Docker 的生命週期，是隨著應用程式的啟動與停止，所以，每個啟動的容器 (Container) 都有可能因爲應用程式發生狀況而停止。而 Docker 本身的機制，會將容器重新以 Image 的原始狀態再重新啟動。

與虛擬機器不同，容器本身並不需要長期，不間斷的執行。容器本身的特性就是會中斷、啟動快速、唯讀 Image 。所以在設計上，需要思考的並不是如何長期的讓容器不間斷地執行，而是思考如何透過 Docker 本身的機制，搭配 DevOps 的流程與適合的 Orchestrator，來讓服務可以不中斷。

而如果有思考到，如何在容器服務啟動的過程中，手動變更應用程式內容 (或設定) 的方式，都需要重新思考是否要搭配適當的 CI/CD 流程，對現有 Image 的修改。

這種反模式沒有解決方式，只有變更自己的思考方式，重新調整對 Docker 的做法

## 反模式 2: 建立不透明的 Docker Image

通常建立 Docker Image 會思考：

- 任何開發者，將 Dockerfile 與其資源 (包含原始碼) 下載後，在任何地方都可以建立出一致的 Image
- 所有的依賴性，包含開發程式所需的依賴項目，都有統一的取用或存取方式 (包含公司內部的 Repository 使用)
- 不使用外部依賴的工具，來建置 Image ，避免離開了建置環境，因為工具的依賴性，導致無法建置出相同的 Image
- 明確定義所使用的軟體版本 (包含套件依賴)
- 透過修改 Dockerfile 就可以做到修改應用程式的版本
- 未產出最終的 Image 版本，無法移轉到生產環境執行

如果撰寫 Dockerfile 的時候，無法在另外一個環境重現，表示設計上需要重新調整

解決方式是仔細了解應用程式建置的步驟，並且仔細的了解 Dockerfile 建置時所發生的狀況，才能設計出更好的 Image 建置步驟。

> 所以在建置 Docker 的時候，也是對自己開發的程式語言一種重新理解的方式

## 反模式 3: 建立有副作用 (Side-Effect) 的 Dockerfile

因為上述的特性，Dockerfile 應該任何人下載都可以建立出相同的 Image ，所以不管幾次的建立，應該最終產出的 Image 都要是一致的，不管是否是在開發者的環境建置，或者是透過 CI 的服務器來建置。

但是如果建置階段，在 Dockerfile 中有以下的步驟：

- 執行 git commit 或其他 git 操作
- 清除或修改資料庫資料
- 呼叫其他外部服務

這樣表示每次建置的步驟，都會有其副作用產生，而且不同次的建置，可能會造成不同的後果。

不要把 Dockerfile 當作 CI 的步驟，或者是當作無限功能的 Bash 腳本集合。

解決方案是簡化 Dockerfile，僅包含下列的可能步驟：

- 複製原始碼
- 下載依賴項目
- 編譯/打包應用程式
- 處理/縮小/轉換 Local 資源
- 在 Docker 環境中執行 shell 文件或編輯文件

因為 Dockerfile 本身有 Cache 機制，如果每個圖層之間並沒有檔案的變化，就可以從 Cache 重新使用，但如果其中的ㄧ個步驟有副作用，會破壞 Cache 機制的執行，導致每次建置都會重新產生新的圖層。

## 反模式 4: 混淆用於部署以及用於開發的 Image

通常在建置 Image 的時候，會有兩種 Image 的角色：部署用的 Image 跟開發用的 Image (或者是 CI/CD 用的 Image )

部署 Image 通常具有下面的特性

- 最小化/編譯過後的應用程式代碼以及 Runtime 的依賴項目
- 沒有了!

第二類是開發用的 Image 或是 CI/CD 用的 Image

- 原始碼 (沒有處理過的)
- 編譯器/壓縮器
- 測試框架/工具
- 安全掃描/代碼質量掃描/程式碼靜態分析工具
- Cloud 集成工具
- CI/CD Pipeline 所需要的實用工具

通常部署到生產環境的 Image ，應該要最小化、安全且經過嚴格處理。在 CI/CD 步驟所產生的任何 Image 通常不會部署到其他地方，所以他的要求 (大小或安全性) 就會小一點。

舉例來說，部署 Image 裡面沒有理由要包含 git 或者是 vim 工具。

不過這邊，請不要思考本地端開發以及生產環境的部署要結合在一起，目前還是很有難度的。

總結，請嘗試了解每種 Image 所扮演的角色。一種 Image 應該只扮演一種角色。如果在部署 Image 中包含了測試的工具或套件，就表示這部分是有做錯誤的。可以嘗試使用 Docker 的多階段建置 (Multi-Stage Build)

## 反模式 5: 不同環境 (QA, Staging, Production) 建置不同的 Image

使用容器的其中一個優點是他的不可變特性，這表示 Docker Image 在任何地方執行都應該有相同的結果。所以 Docker Image 應該只有建立一次，然後在散佈到不同的各種環境，直到最後的生產環境。

因為這樣，才可以保證在測試環境中的內容與另外一個環境的內容完全一致。如果針對不同的環境建置不同的 Image ，無法保證其行為是否一致，這樣或許表示會需要導入更多的測試，或者是需要導入額外的 debug 工具，這樣反而會讓不同環境間的差異更難處理。

但是，不同環境有不同的設定 (像是 Secret 或環境變數)，這是完全正常的，但是請保證其他所有內容都應該完全一樣。

## 反模式 6: 在生產服務器上直接產生 Docker Image

Docker registry 是用來存放所建立好的應用程式 Image 的一個目錄服務，可以讓任何環境都可以很容易的重新取得或部署應用服務的 Image ，也是一個中心的服務，用來保存應用服務 Image 的歷史版本。

通常公司會思考使用兩組 registry，一個對應開發環境，一個對應生產環境。一個 docker image 應該建置完後就被放置到開發的 registry，經過整合測試、安全掃描、以及其他的質量檢查等工作，確認之後就可以升級到正式的 registry 去，並發行到生產環境執行。

Docker 的部署規劃，應該要包含 registry 本身，可以用來充當資產儲存庫也當作中間的儲存庫。

如果做法是在生產環境透過 git 直接抓下原始碼來建置，這部分會造成許多問題

- 生產環境的機器應該不能訪問 git repository
- Git 應該是開發人員使用的工具，不應該是營運環境所需要使用的工具
- 在生產環境上執行的 image 是沒有辦法管理的，你不會知道上面跑了什麼 image
- git repository 會需要外部的訪問權限，如果公司內部對原始碼有安全性管理的話

這種直接抓下原始碼建置的動作，可能在剛開始建置環境的時候行得通，但如果面臨到較大量的安裝，就會有瓶頸。 docker registry 是有他的優勢，而且現在的工具都還有其他的安全性功能 (像是弱點掃描等)，而且現在 docker registry 也都有相關的 API 可以操作。

而且，透過 docker registry ，原始碼也可以安全地在公司防火牆內保存。

## 反模式 7: 使用 git hash 代替 docker image

> 這邊的 git hash 指的是每次 git 的 commit，因為每次 commit.都會產生一組唯一的 hash，用來表示每次的程式碼發佈版本

參考上面的兩個反模式推論，代表如果使用了 docker，docker registry 應該是唯一用來發行最終產出的最後結果。開發人員以及維運人員，應該使用容器來當作共通的語言，互相之間移交的項目也應該會是容器，而不是 git 的某個 commit。

較早以前的產品發行，可能會是以一個版本管理的 commit 為一個發行階段，透過 CI/CD 的建置，產出最終的成品 (artifact)，但是如果要重新發行到不同環境，可能會以相同的 commit 為主，重新建置發行一套相同的應用程式，這樣也容易浪費建置資源。

如果採用了 docker image 為最終發行的成品，表示維運人員並不需要知道 git repo 發生了什麼事情，他們只需要知道 docker image 是否已經準備好了，可以部署到生產環境去，因為是使用相同的 image，所以不需要重新建置。

維運人員也可以不需要了解測試工具或建置程式的系統等，一般維運的日常操作並不需要。

## 反模式 8: 硬編碼 secret 以及設定在 docker image 中

此模式與反模式 5 相關。通常如果不同環境需要不同的 image，代表裡面包含了不同環境的設定或一些安全金鑰等資訊。

這樣表示，你需要在建置的過程當中管裡所有環境的設定以及安全金鑰等資訊，這會讓整個建置 (CI/CD) 步驟變得複雜。思考[12 因子的建置](https://12factor.net/config)部分說明。

應用程式應該是在執行階段才獲取到設定，而不是在建置的時候。這有很多種做法可以做到，像是環境變數，或者是搭配其他的服務 (k8s configmap, etcd, zookeeper, consul 等) 以及 secret 的機制 (k8s secret, confidart, cerberus, valutrepo 等)

## 反模式 9: Dockerfile 內做的事情太多

原文的範例，將 Dockerfile 當作 CI 使用：

```
# Run Sonar analysis
FROM newtmitch/sonar-scanner AS sonar
COPY src src
RUN sonar-scanner

# Build application
FROM node:11 AS build
WORKDIR /usr/src/app
COPY . .
RUN yarn install \
 yarn run lint \
 yarn run build \
 yarn run generate-docs
LABEL stage=build

# Run unit test
FROM build AS unit-tests
RUN yarn run unit-tests
LABEL stage=unit-tests

# Push docs to S3
FROM containerlabs/aws-sdk AS push-docs
ARG push-docs=false
COPY --from=build docs docs
RUN [[ "$push-docs" == true ]] &amp;&amp; aws s3 cp -r docs s3://my-docs-bucket/

# Build final app
FROM node:11-slim
EXPOSE 8080
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/dist dist
USER node
CMD ["node", "./dist/server/index.js"]
```

這個範例有結合到前面的幾個反模式：

- 假定 Sonar 服務存在 (模式 2)
- 可能會推送資料到 S3 (模式 3)，具有潛在的副作用
- 可以做為佈署 image ，也可以作為開發 image (模式 4)

Dockerfile 與 CI 的技術是不同的領域，基本上現在的 CI 功能已經可以做到很好，不需要將要在 CI 管道中執行的指令與在 Docker 容器中執行的指令混淆。

修改此 Dockerfile 的方法是把它拆成不同的 Dockerfile，並在 CI 階段用不同的步驟分開執行，讓每個 Dockerfile 都有自己的單一目標。

## 反模式 10: Dockerfile 內做的事情太少

容器在建置時，會包含處理應用程式的程式庫依賴關係，這也很適合用來隔離每個應用程式之間的程式庫以及框架版本。因為傳統開發人員會在自己的開發環境安裝不同版本的工具，所以常常導致開發環境的混亂。但是 Dockerfile 可以用來準確的描述應用程式所需要的內容 (但是這需要開發人員確實的使用這樣的作法，這種關係才會成立)。

所以對維運人員來講，可以不需要安裝不同的開發工具，像是 Java、.NET、Python 等，只需要下載不同的 docker image 即可。

早期有一種建置 docker image 的方式，是將相依的程式庫在建置過程當中從本地端複製進去：

```
FROM openjdk:8-jdk-alpine
VOLUME /tmp
ARG JAR_FILE
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom"，"-jar","/app.jar"]
```

在這份 Dockerfile 中並沒有說明 app.jar 是怎麼產生的，也沒有說明來源，所以實際建置的時候，是無法得知，這會造成建置的困難，如果還有不同語言，會更麻煩。

```
FROM openjdk:8-jdk-alpine
COPY pom.xml /tmp/
COPY src /tmp/src/
WORKDIR /tmp/
RUN ./gradlew build
COPY /tmp/build/app.war /app.jar
ENTRYPOINT ["java","-Djava.security.egd = file:/dev/./urandom","-jar","/app.jar"]
```

上面的 Dockerfile 就明確的說明了建置步驟，並且，建置時，不需要安裝 Java 環境。但是還是有改善的空間 (Multi-Stage Build)
