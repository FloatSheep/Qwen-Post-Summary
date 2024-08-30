import { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import { ofetch } from "ofetch";
import * as theInterface from "../src/interface/main";
import getEnv from "../src/utils/getEnv";
import { setGlobalDispatcher, ProxyAgent } from "undici";

const headerConfig = [
  { name: "Access-Control-Allow-Origin", value: "*" },
  { name: "Access-Control-Allow-Methods", value: "POST" },
  { name: "Access-Control-Allow-Headers", value: "*" },
  { name: "Access-Control-Max-Age", value: "1728000" },
];

export default async (req: VercelRequest, res: VercelResponse) => {
  headerConfig.map((configItem) => {
    res.setHeader(configItem.name, configItem.value);
  });

  const reqBody = req.body;

  if (req.method !== "POST") {
    res.status(405).json({
      code: 0,
      message: `请求方式应为 POST，而不是 ${req.method}`,
    });

    return;
  } else if (!reqBody) {
    res.status(400).json({
      code: 0,
      message: "请求体不能为空",
    });

    return;
  } else if (!reqBody.postId) {
    res.status(400).json({
      code: 0,
      message: "请求体中缺少 postId 字段",
    });

    return;
  }

  try {
    const postContent = await kv.get(reqBody.postId);
    const requestBody = {
      content: req.body.content,
    };
    if (!postContent || postContent === null) {
      const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
      getEnv("PROXY_ENABLE") ? setGlobalDispatcher(proxyAgent) : null;
      const summaryContent = await ofetch<theInterface.summaryResponse>(
        getEnv("SUMMARY_API"),
        {
          body: requestBody,
          method: "POST",
          parseResponse: JSON.parse,
        }
      );

      await kv.set(reqBody.postId, summaryContent.response);

      res.status(200).json({
        code: 1,
        message: "处理文章摘要成功",
        data: summaryContent.response,
        cache: false,
      });
      return;
    } else {
      res.status(200).json({
        code: 1,
        message: "处理文章摘要成功",
        data: postContent,
        cache: true,
      });

      return;
    }
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: `处理文章摘要失败: ${error}`,
    });

    return;
  }
};
