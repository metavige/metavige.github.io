---
title: "log4net Action Log 設定"
date: 2015-03-25 09:00:00
categories:
- 程式開發
tags:
- log4net
- dotnet
slug: "log4net-actionlog"
---

我之前設定網站執行的 Action Log 的一個記錄，有些東西都是拼拼湊湊出來的，並不見得是最佳版本     

log4net 設定檔  

```xml
<?xml version="1.0" encoding="utf-8" ?>
<log4net>
    <root>
        <level value="DEBUG" />
        <appender-ref ref="stdout" />
        <appender-ref ref="ActionLogRollingFile" />
    </root>
    <appender name="ActionLogRollingFile" type="log4net.Appender.RollingFileAppender">
        <file type="log4net.Util.PatternString" value="action.log" />
        <appendToFile value="true" />
        <encoding value="utf-8" />
        <maxSizeRollBackups value="30" />
        <rollingStyle value="Date" />
        <datePattern value="'.'yyyy-MM-dd" />
        <layout type="log4net.Layout.PatternLayout">
            <conversionPattern value="(%date{HH:mm:ss,fff}) [%t] - %u %5property{Duration} %property{StatusCode} %6property{Method} %property{Uri} %m%n " />
        </layout>
        <filter type="log4net.Filter.LoggerMatchFilter">
            <acceptOnMatch value="true" />
            <LoggerToMatch value="Sample.Web.Filters.WebApiActionFilter" />
        </filter>

        <filter type="log4net.Filter.DenyAllFilter" />
    </appender>
</log4net>
```


其中要注意的是

- log4net.Filter.LoggerMatchFilter: 用來設定特定的 class 記錄才使用這個 Appender  
    - acceptOnMatch: 這個設定有點像是 blacklist/whitelist，true 表示有 match 才是，相當於 whitelist  
    - LoggerToMatch: 設定要篩選的類別名稱  
- log4net.Filter.DenyAllFilter: 篩選掉其他的 Log，不會在這個 Appender 裡面記錄  


<!--more-->

C# Filter 程式參考   

```csharp
/// <summary>
/// 執行 Web Api 的呼叫記錄
/// </summary>
/// <remarks>
/// 紀錄資料:
///
///     呼叫時間
///     USER
///     URL
///     METHOD
///     BODY
///     StatusCode
///     Duration
///
/// Logger 的紀錄格式，參考 https://logging.apache.org/log4net/release/sdk/log4net.Layout.PatternLayout.html
/// </remarks>
public class WebApiActionFilter : ActionFilterAttribute
{
    private ILog Logger { get; set; }

    public WebApiActionFilter()
    {
        Logger = LogManager.GetLog(GetType());
    }

    public WebApiActionFilter(ILog logger)
    {
        Logger = logger;
    }

    private ThreadLocal<Stopwatch> counter = new ThreadLocal<Stopwatch>(() => new Stopwatch());
    public static ThreadLocal<Task<string>> RequestBody = new ThreadLocal<Task<string>>();

    public override void OnActionExecuting(HttpActionContext actionContext)
    {
        RequestBody.Value = actionContext.Request.Content.ReadAsStringAsync();
        counter.Value.Start();
    }

    public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
    {
        counter.Value.Stop();
        LogActivity(actionExecutedContext.ActionContext, actionExecutedContext.Response);
    }

    private void LogActivity(HttpActionContext actionContext, HttpResponseMessage response)
    {
        try
        {
            var loggerProp = ThreadContext.Properties;
            loggerProp["Uri"] = actionContext.Request.RequestUri.PathAndQuery;
            loggerProp["Method"] = actionContext.Request.Method.Method;
            loggerProp["Duration"] = counter.Value.ElapsedMilliseconds;
            loggerProp["StatusCode"] = (int) response.StatusCode;

            Logger.Info(RequestBody.Value.Result);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
        }
    }
}

/// <summary>
/// 用來擷取傳入的 Request Content Body, 因為沒辦法在 Filter 中取得 Body
/// </summary>
/// <remark>
/// 如果需要抓傳遞資料才需要
/// </remark>
public class LogBodyDelegateHandler : DelegatingHandler
{

    protected async override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
    {
        if (request.Content != null)
        {
            var requestText = request.Content.ReadAsStringAsync();

            WebApiActionFilter.RequestBody.Value = requestText;
        }
        // Execute the request, this does not block
        var response = base.SendAsync(request, cancellationToken);

        return response.Result;
    }
}
```


另外從網路上有查到一篇不錯的文章，[http://it.tomtang.idv.tw/2013/12/log4net-best-practice.html]()  
這篇是在說明 log4net 的一些設定建議  

以下是他一個常用設定值的參考    

```xml
<?xml version="1.0" encoding="UTF-8"?>
<log4net>
  <appender name="ErrorFile" type="log4net.Appender.RollingFileAppender">
    <file type="log4net.Util.PatternString" value="C:\applications\logs\%property{appname}\Error-%property{appname}.log" />
    <encoding value="utf-8" />
    <appendToFile value="true" />
    <maximumFileSize value="10000KB" />
    <maxSizeRollBackups value="50" />
    <lockingModel type="log4net.Appender.FileAppender+MinimalLock" />
    <layout type="log4net.Layout.PatternLayout">
      <conversionPattern value="%date&#x9;[%thread]&#x9;%level&#x9;%logger&#x9;%property{appname}&#x9;- %message%newline" />
    </layout>
    <filter type="log4net.Filter.LevelRangeFilter">
      <levelMin value="ERROR" />
      <levelMax value="FATAL" />
    </filter>
    <filter type="log4net.Filter.DenyAllFilter" />
  </appender>
  <appender name="WarnFile" type="log4net.Appender.RollingFileAppender">
    <file type="log4net.Util.PatternString" value="C:\applications\logs\%property{appname}\Warn-%property{appname}.log" />
    <encoding value="utf-8" />
    <appendToFile value="true" />
    <maximumFileSize value="10000KB" />
    <maxSizeRollBackups value="50" />
    <lockingModel type="log4net.Appender.FileAppender+MinimalLock" />
    <layout type="log4net.Layout.PatternLayout">
      <conversionPattern value="%date&#x9;[%thread]&#x9;%level&#x9;%logger&#x9;%property{appname}&#x9;- %message%newline" />
    </layout>
    <filter type="log4net.Filter.LevelMatchFilter">
      <param name="LevelToMatch" value="WARN" />
    </filter>
    <filter type="log4net.Filter.DenyAllFilter" />
  </appender>
  <appender name="InfoFile" type="log4net.Appender.RollingFileAppender">
    <file type="log4net.Util.PatternString" value="C:\applications\logs\%property{appname}\Info-%property{appname}.log" />
    <encoding value="utf-8" />
    <appendToFile value="true" />
    <maximumFileSize value="10000KB" />
    <maxSizeRollBackups value="50" />
    <lockingModel type="log4net.Appender.FileAppender+MinimalLock" />
    <layout type="log4net.Layout.PatternLayout">
      <conversionPattern value="%date&#x9;[%thread]&#x9;%level&#x9;%logger&#x9;%property{appname}&#x9;- %message%newline" />
    </layout>
    <filter type="log4net.Filter.LevelMatchFilter">
      <LevelToMatch value="INFO" />
    </filter>
    <filter type="log4net.Filter.DenyAllFilter" />
  </appender>
  <appender name="RollingFile" type="log4net.Appender.RollingFileAppender">
    <file type="log4net.Util.PatternString" value="C:\applications\logs\%property{appname}\ALL-%property{appname}.log" />
    <encoding value="utf-8" />
    <appendToFile value="true" />
    <maximumFileSize value="10000KB" />
    <maxSizeRollBackups value="50" />
    <lockingModel type="log4net.Appender.FileAppender+MinimalLock" />
    <layout type="log4net.Layout.PatternLayout">
      <conversionPattern value="%date&#x9;[%thread]&#x9;%level&#x9;%logger&#x9;%property{appname}&#x9;- %message%newline" />
    </layout>
  </appender>
  <appender name="debugger" type="log4net.Appender.OutputDebugStringAppender">
    <layout type="log4net.Layout.PatternLayout">
      <conversionPattern value="%date&#x9;[%thread]&#x9;%level&#x9;%logger&#x9;%property{appname}&#x9;- %message%newline" />
    </layout>
  </appender>
  <root additivity="true">
    <level value="ALL" />
    <appender-ref ref="debugger" />
    <appender-ref ref="RollingFile" />
    <appender-ref ref="InfoFile" />
    <appender-ref ref="WarnFile" />
    <appender-ref ref="ErrorFile" />
  </root>
  <logger name=「doway.sample.helloworld」>
    <level value="WARN" />
  </logger>
</log4net>
```

參考  
- [Tom's IT notebook](http://it.tomtang.idv.tw/)  
- [http://www.claassen.net/geek/blog/2009/06/log4net-filtering-by-logger.html]()
