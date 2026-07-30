---
title: "AI Agent Sandbox 深度解析"
date: 2026-07-30 20:40:00
slug: "ai-agent-sandbox"
description: "從 Docker Sandbox、OrbStack 到 AI 開發環境的未來"
tags:
- AI
- ai-agent
- docker
- sandbox
- security
categories:
- 程式開發
---

> AI Agent 已經從「回答問題」進化成「執行工作」。當 AI 開始擁有修改程式碼、執行 Terminal、操作 Git、呼叫 API 的能力時，如何建立一個**安全、可控、可重建**的執行環境，就成為新的工程議題。

## 前言

近幾年，大型語言模型（LLM）快速發展。

一開始，我們只是把 ChatGPT 當作聊天機器人。

現在則逐漸變成：

* Claude Code
* Codex CLI
* Gemini CLI
* OpenAI Codex Agent
* 各種 AI Coding Assistant

它們已經可以：

* 修改程式碼
* 執行 Terminal
* 執行 Build
* 執行 Test
* 操作 Git
* 呼叫 API
* 使用 MCP Server
* 自動完成整個開發流程

也因此，一個新的問題開始浮現：

> **如果 AI 擁有和開發者相同的權限，它到底能做到多少事情？**

這也是 Docker 最近推出 **Docker Sandbox** 的原因。

## AI Agent 面臨的安全問題

傳統上，我們直接在自己的電腦執行 AI Agent：

```
Mac / Windows
        │
        ▼
Claude Code
Codex CLI
Gemini CLI
```

AI 通常會透過 Terminal 執行。

因此，它的權限通常等同於目前登入的使用者。

如果你的帳號可以：

```
git push
kubectl delete
aws s3 rm
rm -rf
```

理論上 AI 也可能做到。

除此之外，它還可能看到：

* SSH Keys
* API Keys
* AWS Credentials
* Azure Credentials
* Git Token
* Documents
* Downloads
* Environment Variables

這代表：

> AI 能存取的範圍，通常就是你的使用者能存取的範圍。

## 傳統 Permission 真的夠嗎？

很多人第一個想法是：

> 「設定權限不就好了？」

這沒有錯。

但這些限制，大多屬於：

* Prompt 規則
* Tool Permission
* 設定檔
* Agent Policy

它們都是**應用程式層級（Application Layer）**的限制。

如果：

* Prompt Injection
* Tool Injection
* Framework Bug
* Runtime 漏洞

都有可能造成權限被繞過。

因此資訊安全一直有一句話：

> **Don't trust. Isolate.**

不要相信程式一定會遵守規則。

而是讓它根本沒有能力做那些事情。

## Sandbox 的核心概念

Sandbox 的目的不是：

> **禁止 AI。**

而是：

> **限制 AI 能夠接觸的世界。**

例如：

```
Host Machine
│
├── Documents
├── SSH Keys
├── Downloads
├── API Keys
│
└── Sandbox
      │
      ├── Project
      ├── Build Tool
      ├── AI Agent
      └── Test Environment
```

AI 永遠只能看到：

```
Project
```

而不是整台電腦。

## Docker Sandbox

Docker 最近提出的 Sandbox，並不是新的 Container 技術。

真正的新概念是：

> **Container 不只是部署工具，而是 AI 的工作空間（Workspace）。**

Docker Sandbox 提供：

* AI Workspace
* Secret Injection
* Network Policy
* Filesystem Isolation
* Resource Limit
* AI Agent 整合
* Disposable Environment

它的目的，就是讓 AI：

> **只能工作在被允許的環境內。**

## Sandbox 可以控制哪些東西？

### 1. Filesystem

限制 AI：

* 只能看到指定 Repository
* 無法讀取 Documents
* 無法讀取 SSH Key
* 無法讀取 Downloads

### 2. Network

可以限制：

* 完全離線
* 僅允許 GitHub
* 僅允許公司 Registry
* Network 白名單

避免資料外洩。

### 3. Resource

限制：

* CPU
* RAM
* Disk

避免：

* 無限 Build
* 無限 Loop
* 吃滿主機資源

### 4. Secret

只注入：

* Git Token
* OpenAI API Key

不提供：

* AWS Secret
* SSH Key
* Azure Credential

### 5. Least Privilege

遵循：

> **只給完成工作需要的最低權限。**

## OrbStack 可以做到嗎？

答案是：

**可以，但定位不同。**

OrbStack 並沒有提供 Docker Sandbox 那種官方 AI Sandbox 功能。

它提供的是：

* Linux VM
* Docker
* Kubernetes
* 快速檔案共享（VirtioFS）

因此可以自行建立：

```
Mac Host
        │
        ▼
OrbStack Linux VM
        │
 ├── Claude Code
 ├── Codex CLI
 ├── Gemini CLI
 ├── Docker
 └── Git Repository
```

AI 完全在 VM 中工作。

Host：

* 不共享 SSH Key
* 不掛載 Documents
* 不暴露 Password

就能達到接近 Sandbox 的效果。

## Docker Sandbox vs OrbStack

| 項目                   | Docker Sandbox | OrbStack            |
| -------------------- | -------------- | ------------------- |
| 定位                   | AI Sandbox 平台  | Linux VM 平台         |
| Container            | ✅              | ✅                   |
| Linux VM             | ❌              | ✅                   |
| AI Agent 整合          | ✅              | ❌                   |
| Secret 管理            | ✅              | 自行管理                |
| Network Policy       | ✅              | 自行設定                |
| Disposable Workspace | ✅              | 可透過 VM 實現           |
| 適合對象                 | AI 開發流程        | 熟悉 Docker / VM 的工程師 |

## 如何選擇？

### Docker Sandbox

適合：

* 想快速開始 AI Sandbox
* 官方支援 AI Agent
* 重視一致性的團隊
* 希望與 AI 工具深度整合

### OrbStack

適合：

* 已經使用 OrbStack
* 熟悉 Docker
* 熟悉 Linux VM
* 希望完全掌控環境
* 想自行打造 AI Sandbox

## 最佳實務

建議每個 Repository 建立獨立 Sandbox：

```
Repository
      │
      ▼
 Sandbox / VM
      │
      ▼
 AI Agent
      │
 Build
 Test
 Commit
```

並遵循以下原則：

* 每個專案一個 Sandbox
* 最小權限（Least Privilege）
* Secret 最小化
* Network 白名單
* 唯讀 Mount
* Disposable Environment
* 可快速重建

## Docker Sandbox 與 Kubernetes 的共同理念

如果你熟悉 Kubernetes，你會發現很多概念非常相似：

| Kubernetes       | AI Sandbox          |
| ---------------- | ------------------- |
| Pod              | AI Workspace        |
| Namespace        | Project Isolation   |
| Resource Limit   | CPU / RAM Limit     |
| Secret           | Secret Injection    |
| Network Policy   | Network Restriction |
| ReadOnly RootFS  | ReadOnly Workspace  |
| Security Context | Least Privilege     |

可以說，Docker Sandbox 是把 Kubernetes 的隔離思維，帶到了 AI 開發流程。

## 未來的 AI 開發模式

未來，一個典型的開發流程可能會是：

```
Git Repository
        │
        ▼
建立 Sandbox / VM
        │
        ▼
AI Agent
        │
 ├── 修改程式
 ├── Build
 ├── Test
 ├── Code Review
 └── Commit
        │
        ▼
CI/CD
```

AI 不再直接操作開發者的電腦，而是在一個可控、可重建的工作空間中完成所有任務。

## 結論

Docker Sandbox 並不是單純的新功能，而是一種新的安全思維。

真正重要的，不是限制 AI「應該做什麼」，而是透過底層隔離，讓 AI **只能做到被允許的事情**。

對於已經使用 Docker 生態系的團隊，Docker Sandbox 提供了官方整合的 AI Workspace；而對熟悉 OrbStack 的工程師來說，也能利用 Linux VM 建立隔離環境，打造屬於自己的 AI Sandbox。

隨著 AI Agent 能力持續提升，「每個專案一個隔離工作空間」很可能會成為未來 AI 開發的標準模式，而安全、可控、可重建，也將成為 AI 開發環境的重要設計原則。

![LLM 執行環境：傳統方式 vs Docker Sandbox vs OrbStack——安全、隔離與可控性的完整比較](sandbox-comparison.png)
