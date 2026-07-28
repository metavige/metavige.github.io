---
title: Visual Studio Code (launch with babel, mocha)
date: 2016-08-10 09:16:53
tags:
- nodejs
- babel
- es2015
categories:
- 程式開發
slug: "vscode-es2015-with-mocha"
---

Visual Studio Code 是個不錯的編輯器，不過設定上，還是有很多需要手動的動作  
特此記錄  

<!--more-->

launch.json 範例: 

```javascript
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run app",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceRoot}/node_modules/babel-cli/bin/babel-node.js",
      "program": "${workspaceRoot}/src/index.js",
      "stopOnEntry": false,
      "args": [
        "--presets es2015,stage-0"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Run mocha",
      "type": "node",
      "program": "${workspaceRoot}/node_modules/mocha/bin/mocha",
      "stopOnEntry": false,
      "args": [
        "--compilers", 
        "js:babel-register",
        "test/**/*.js"
      ],
      "cwd": "${workspaceRoot}",
      "runtimeExecutable": null,
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
```

