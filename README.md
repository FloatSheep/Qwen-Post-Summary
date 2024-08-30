# Qwen-Vercel-Middleware

这是 main 分支的中间件，具有缓存、加快响应速度（由 Vercel 路由到 Cloudflare Worker 而不是访客路由）的功能

缺点：

- Cloudflare Worker 将等待 AI 完成后才进行输出，因此无法实现流式输出（需要前端进行实现）

## 快速开始

在 main 分支的基础上，将 Cloudflare Worker 代码修改为 [worker.js][1] 中的代码，然后点击下方的 Deploy 按钮，快速部署本项目

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFloatSheep%2FQwen-Post-Summary%2Ftree%2Fvercel&env=SUMMARY_API,PROXY_ENABLE&envDescription=SUMMARY_API%20%E4%B8%BA%20Cloudflare%20Worker%20%E6%89%80%E7%BB%99%E5%87%BA%E7%9A%84%E5%9F%9F%E5%90%8D%EF%BC%8CPROXY_ENABLE%20%E8%AF%B7%E5%A1%AB%E5%86%99%20false)

`SUMMARY_API` 为 Cloudflare Worker 绑定的域名

`PROXY_ENABLE` 请填写 false，**勿动**

部署完成后绑定域名即可！

## 前端使用



[1]: </worker/worker.js>
