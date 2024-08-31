import { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "@vercel/kv";
import { ofetch } from "ofetch";
import * as theInterface from "../src/interface/main";
import getEnv from "../src/utils/getEnv";
/* import { setGlobalDispatcher, ProxyAgent } from "undici"; */

const headerConfig = [
  { name: "Access-Control-Allow-Origin", value: "*" },
  { name: "Access-Control-Allow-Methods", value: "*" },
  { name: "Access-Control-Allow-Headers", value: "*" },
  { name: "Access-Control-Max-Age", value: "1728000" },
];

/* if (getEnv("PROXY_ENABLE")) {
  const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
  setGlobalDispatcher(proxyAgent);
} */

export default async (req: VercelRequest, res: VercelResponse) => {
  headerConfig.map((configItem) => {
    res.setHeader(configItem.name, configItem.value);
  });

  const reqBody = req.body;
  const query = req.query;

  console.log("reqBody", reqBody); // debug use

  if (req.method === "OPTIONS") {
    res.status(200).json({
      code: 1,
      message: "OPTIONS 请求成功",
    });

    return;
  } else if (req.method === "GET") {
    if (query.postId) {
      const { postId } = req.query;
      const singlePostId = typeof postId === 'string' ? postId : postId[0];
      const summaryData = await kv.get(singlePostId);

      if (summaryData != null || summaryData != undefined) {
        res.status(200).json({
          code: 1,
          message: "获取文章摘要成功",
          data: summaryData,
          isSave: true,
        });

        return;
      } else {
        res.status(200).json({
          code: 1,
          message: "文章摘要不存在",
          data: null,
          isSave: false,
        });

      return;
      }
    } else {
      res.status(400).json({
        code: 0,
        message: "请求参数错误",
      });

      return;
    }
    return;
  } else if (req.method !== "POST") {
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
    console.log("postContent", postContent); // debug use
    const requestBody = {
      content: reqBody.content,
    };
    if (!postContent || postContent === null) {
      const summaryContent = await ofetch<theInterface.summaryResponse>(
        getEnv("SUMMARY_API"),
        {
          body: requestBody,
          method: "POST",
          timeout: 6000000,
          parseResponse: JSON.parse,
          async onRequestError({ request, options, error }) {
            console.log("ofetch 请求失败：", request, options, error);
          },
          async onResponseError({ request, response, options }) {
            console.log(
              "ofetch [fetch response error]",
              request,
              response.status,
              response.body
            );
          },
        }
      );

      console.log("summaryContent", summaryContent); // debug use

      await kv.set(reqBody.postId, summaryContent.response);

      console.log("kvAfter summaryContent", postContent); // debug use

      res.status(200).json({
        code: 1,
        message: "处理文章摘要成功",
        data: summaryContent.response,
      });
      return;
    } else {
      res.status(200).json({
        code: 1,
        message: "处理文章摘要成功",
        data: postContent,
      });

      return;
    }
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: `处理文章摘要失败: ${error}`,
    });
    console.log("O Catch error", error);
  }
};
