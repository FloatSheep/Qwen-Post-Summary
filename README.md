# Qwen-Post-Summary

> 请参考 [这篇文章](https://mabbs.github.io/2024/07/03/ai-summary.html) 或 [Qwen-Vercel-Middleware](https://github.com/FloatSheep/Qwen-Post-Summary/tree/vercel) 使用更加完善的文章摘要

使用 Cloudflare Worker AI 的通义千问模型为你的文章生成摘要

Original Code: [AI! - Github Gist][1]

为博客添加摘要支持详见 [adapter.md][2]

## Deploying

进入 Cloudflare Workers 创建页面

选择使用 `LLM App` 模板创建（如下图）

![image](https://github.com/FloatSheep/Qwen-Post-Summary/assets/142888681/fbc3cf38-d41e-4e9f-b5fa-cc46f008b7b4)

命名并保存后，进入 Worker 的编辑代码界面，将 [workers/index.js](workers/index.js) 中的代码复制并粘贴到 index.js 中

![image](https://github.com/FloatSheep/Qwen-Post-Summary/assets/142888681/07828328-245e-4520-84b6-cdbebe63cc17)

点击右上角的部署，如果没有部署请切换（如下图）

![image](https://github.com/FloatSheep/Qwen-Post-Summary/assets/142888681/d1924243-531e-4c37-a0f0-de9571c87642)

部署完成后，你的 Qwen Summary API 就运行在了 Worker 上，你可以通过 Workers 分配的域名访问（如下图）

![image](https://github.com/FloatSheep/Qwen-Post-Summary/assets/142888681/c97f6ed0-7e59-4ad1-be68-2fb7c879f20e)

## Usage

本 API 会返回 EventStream，因此，你应该使用 EventStream 的方式来解析，如下为示例

```javascript
// main.js
addEventListener("DOMContentLoaded", () => {
  const apiUrl = "" // 这里填写你获得的 API 地址
  const outputContainer = document.getElementById("ai-output");

  // 测试数据
  const postTitle = "《Hi,Cloudflare Workers AI》";
  const postBeforeContent = `
    这货其实已经发布有段时间了，但，效果嘛，差强人意。可人家免费啊，还自带 Workers 调用，省去鉴权若干代码，自个儿绑个域名，每分钟 100 次，美滋滋～
    
    以下代码配套「哔哔广场」食用，当然也可自行折腾。
    
    新建 Cloudflare Workers 丢入以下代码保存并绑定域名，填入广场设置处即可～
    
    import { Ai } from './vendor/@cloudflare/ai.js';
    export default {
        async fetch(request, env, ctx) {
          const jsonheaders = {
            "content-type": "text/event-stream",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': "*",
            'Access-Control-Allow-Headers': "*",
            'Access-Control-Max-Age': '86400',
          };
    
        const url = new URL(request.url);
        const query = decodeURIComponent(url.searchParams.get('q'));
            const ai = new Ai(env.AI, { sessionOptions: { ctx: ctx } });
            let chat = {
              messages: [
                { role: 'system', content: 'You are a helpful and responsive assistant, you answer questions directly and provide instruction unless told otherwise.Respond in Chinese.' },
                { role: 'user', content: query }
              ]
            };
            const stream = await ai.run(
                "@cf/mistral/mistral-7b-instruct-v0.1",
                { messages: chat.messages, stream: true  }
            );
            return new Response(stream,
                { headers: jsonheaders, }
            );
        }
    }
    以上代码的提示词可以自己更换。
    
    其中文本生成的模型有这几种可以设定：
    
    @cf/meta/llama-2-7b-chat-fp16
    @cf/mistral/mistral-7b-instruct-v0.1
    @cf/meta/llama-2-7b-chat-int8
  `;
  const postContent = postBeforeContent.replace(/\n/g, '').replace(/[ ]+/g, ' ').replace(/<pre>[\s\S]*?<\/pre>/g, '').substring(0, 1800);

  const evSource = new EventSource(apiUrl + `/?q=${postTitle}，文章内容：${postContent}`);
  evSource.onmessage = (event) => {
    if (event.data == "[DONE]") {
      evSource.close();
      return;
    } else {
        const data = JSON.parse(event.data);
        outputContainer.textContent += data.response ;
    }
  }
});
```

```html
<!-- index.html -->
<!DOCTYPE HTML>
<html>
  <head>
    ...Head
    <script src="./main.js" />
  </head>
  <body>
    <p id="ai-output"></p>
  </body>
</html>
```

修改并保存上述文件，然后打开临时网页服务器进行测试，得到如下（或类似结果）

![image](https://github.com/FloatSheep/Qwen-Post-Summary/assets/142888681/890cfab4-38e4-4382-9dac-e58efa9cd858)

[1]: <https://gist.github.com/FloatSheep/5b54ffadf704379295c3a6dc950b9b97>
[2]: <adapter.md>
