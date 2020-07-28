title: "Web API (Server) 端步驟，用 Owin"
date: 2015-03-11 17:32:21
categories: 程式開發
tags:
- OAuth2
- Owin
- csharp
- .Net
---

<!--more-->

```
Install-Package Microsoft.AspNet.WebApi.Owin
Install-Package Microsoft.Owin.Security.Jwt
Install-Package Microsoft.Owin.Host.SystemWeb
```

- 先開啟一個 Asp.Net Web 的專案，記得選擇 Web API
- 驗證的部份可以不選，只要注意要安裝的 packages (這邊不講預設的 packages)
    - [Microsoft.AspNet.WebApi.Owin](https://www.nuget.org/packages/Microsoft.AspNet.WebApi.Owin/) - 3.0.0
    - [Microsoft.Owin.Security.OAuth](https://www.nuget.org/packages/Microsoft.Owin.Security.OAuth/) - 3.0.0
    - [Microsoft.Owin.Security.Jwt](https://www.nuget.org/packages/Microsoft.Owin.Security.Jwt/) - 3.0.0
    - [Microsoft.Owin.Host.SystemWeb](https://www.nuget.org/packages/Microsoft.Owin.Host.SystemWeb/) - 3.0.0, 這個很重要，如果你的應用程式是安裝在 IIS 上面，就一定要安裝這個 package，這樣你在 Owin 上面的設定才會有效。
    - [System.IdentityModel.Tokens.Jwt](https://www.nuget.org/packages/System.IdentityModel.Tokens.Jwt/) - 4.0.1, 這是有關 JwtToken 解析的相關程式，要裝

- 設定 Owin Server OAuth Bearer 驗證 - 如果在專案中沒有看到 Startup.cs 這個類別，請透過 `加入` -> `OWIN 啟動類別` 先加入 Startup.cs 在專案裡面。然後加上一個檔案 `Startup.OAuthBearer.cs` 在 `App_Start` 目錄下 (這算是慣例)


`Startup.OAuthBearer.cs` 的範例 (issuer, audience, secret 要參考 [JWT](2015/03/11/jwt/#more) 的解釋)：

```csharp

using Microsoft.Owin.Security;
using Microsoft.Owin.Security.DataHandler.Encoder;
using Microsoft.Owin.Security.Jwt;
using Microsoft.Owin.Security.OAuth;
using Owin;

public partial class Startup
{
    public void ConfigOAuthBearer(IAppBuilder app)
    {
        var issuer = "https://jwt-token.com";
        var audience = "099153c2625149bc8ecb3e85e03f0022";
        var secret = TextEncodings.Base64Url.Decode("IxrAjDoa2FqElO7IhrSrUJELhUckePEPVpaePlS_Xaw");

        // 透過 OAuth2 Bearer Token 做驗證
        app.UseJwtBearerAuthentication(
            new JwtBearerAuthenticationOptions
            {
                AuthenticationMode = AuthenticationMode.Active,
                AllowedAudiences = new[] { audience },
                IssuerSecurityTokenProviders = new IIssuerSecurityTokenProvider[]
                {
                    new SymmetricKeyIssuerSecurityTokenProvider(issuer, secret)
                },
                Provider = new OAuthBearerAuthenticationProvider()
            });
    }
}
```

- 在 Startup.cs 中呼叫這個 ConfigOAuthBearer 的方法

```csharp

public partial class Startup
{
    public void Configuration(IAppBuilder app)
    {
        ConfigOAuthBearer(app);
    }
}
```

- 建立一個 Web API，記得要加上 [Authorize] 才有用

```csharp

using System.Web.Http;

namespace ResourceApi.Controllers
{
    [Authorize]
    public class ValuesController : ApiController
    {
        // GET api/values
        public string Get()
        {
            return "Hello " + User.Identity.Name;
        }

    }
}
```

如果以上的設定都沒有什麼問題，Server 端大概就到這邊，就結束設定了
之後要取得由 Client 端傳遞過來的使用者資料，就直接抓 User.Identity 就可以

