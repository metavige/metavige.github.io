---
title: "在 .Net 專案使用 gulp build"
date: 2015-12-12 09:58:06
tags:
- dotnet
- gulp
- javascript
categories:
- 程式開發
slug: "dotnet-proj-with-gulp"
---

一直以來，開發 .Net 專案，因為只能在 Windows 上使用 Visual Studio 開發  
Build Project 的 Performance 總是我一個覺得很麻煩的事情   

<!--more-->

參考目前開發 web project 的經驗，決定找 gulp 相關的資料來改  

### 步驟

- 先用 `npm init` 建立 package.json
- 安裝套件：

```bash
npm install --save-dev gulp gulp-msbuild
```

- 寫 `gulpfile.js`

```javascript
var gulp = require('gulp');
var msbuild = require('gulp-msbuild');

gulp.task("build", function () {
    return gulp.src("./Sample.sln")
                .pipe(msbuild({
                    targets: ['Clean', 'Build'],
                    toolsVersion: 14.0,
                    errorOnFail: true
                })
        );
});

gulp.task('watch', function () {
    gulp.watch('**/*.cs', ['build']);
});

gulp.task('default', ['build']);
```

- 開啟 `cmd`，執行 `gulp watch`

### 後記

這邊提供的方式，可以讓編譯這件事情，在背景作業。在你有改變程式碼之後自動作業  
因為我自己寫程式的過程，以及看同事在執行 .Net 專案的作法，大多數時間都是在等待編譯  
這些時間其實都很浪費  

要加速開發，這只是一個小動作而已，網路上找到的[文章](http://www.mikeobrien.net/blog/using-gulp-to-build-and-deploy-dotnet-apps-on-windows/)，是可以在搭配更多 Task 來做測試、改變版本號等自動化動作  
但是這還需要些時間來整合，這邊只是簡單的改變 build 的部分  

### Reference

- [Using Gulp to Build and Deploy .NET Apps on Windows](http://www.mikeobrien.net/blog/using-gulp-to-build-and-deploy-dotnet-apps-on-windows/)
- [gulp-msbuild](https://www.npmjs.com/package/gulp-msbuild)
- [gulp-mstest](https://www.npmjs.com/package/gulp-mstest)
