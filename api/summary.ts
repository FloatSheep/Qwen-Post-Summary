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

/* const proxyAgent = new ProxyAgent("http://127.0.0.1:10808");
setGlobalDispatcher(proxyAgent); */

// 获取允许的来源列表
const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) return [];
  return origins.split(",").map((origin) => origin.trim());
};

// 检查是否为允许的来源
const isValidReferer = (referer: string | undefined): boolean => {
  if (!referer) return false;

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.length === 0) return true; // 如果没有设置允许的来源，则不限制

  try {
    const refererUrl = new URL(referer);
    const refererHostname = refererUrl.hostname;

    return allowedOrigins.some((origin) => {
      // 如果origin包含协议（http://或https://），则按完整URL处理
      if (origin.includes("://")) {
        try {
          const allowedUrl = new URL(origin);
          const allowedOrigin = `${allowedUrl.protocol}//${allowedUrl.hostname}`;
          const refererOrigin = `${refererUrl.protocol}//${refererUrl.hostname}`;
          return refererOrigin === allowedOrigin;
        } catch (e) {
          console.warn(`Invalid origin in ALLOWED_ORIGINS: ${origin}`);
          return false;
        }
      } else {
        // 如果origin不包含协议，认为是域名（支持主域名及子域名匹配）
        return (
          refererHostname === origin || refererHostname.endsWith("." + origin)
        );
      }
    });
  } catch (e) {
    console.error("Error parsing referer URL:", referer, e);
    return false;
  }
};

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    headerConfig.map((configItem) => {
      res.setHeader(configItem.name, configItem.value);
    });

    const referer = req.headers.referer || req.headers.referrer;
    const origin = req.headers.origin;
    const forwardedReferer = req.headers["x-forwarded-referer"];

    // 组合所有可能的来源头部信息进行检查
    const combinedReferer = referer || forwardedReferer;
    const normalizedReferer = Array.isArray(combinedReferer)
      ? combinedReferer[0]
      : combinedReferer;
    const normalizedOrigin = Array.isArray(origin) ? origin[0] : origin;

    // 检查 Origin 或 Referer 是否有效
    const isRefererValid = isValidReferer(normalizedReferer);
    const isOriginValid = isValidReferer(normalizedOrigin);

    console.log(
      "🤤 请求来源 Referer",
      normalizedReferer,
      "Origin",
      normalizedOrigin,
      JSON.stringify(req.headers)
    );

    if (!isRefererValid && !isOriginValid) {
      res.status(403).json({
        code: 0,
        message: "Forbidden: Invalid referer or origin",
      });

      console.log("🤤 请求来源无效，已拒绝访问", normalizedReferer, normalizedOrigin, isRefererValid, isOriginValid);

      return;
    }

    const reqBody = req.body;
    const query = req.query;

    console.log("🤤 获得请求", reqBody);

    if (req.method === "OPTIONS") {
      res.status(200).json({
        code: 1,
        message: "OPTIONS 请求成功",
      });

      return;
    } else if (req.method === "GET") {
      if (query.postId) {
        const { postId } = req.query;
        const singlePostId = typeof postId === "string" ? postId : postId[0];
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
      const summaryKV = await kv.get(reqBody.postId);
      console.log("🤤 尝试从 KV 中获取摘要信息", summaryKV); // debug use
      const requestBody = {
        content: reqBody.content,
      };
      if (!summaryKV || summaryKV === null) {
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

        console.log("🤤 尝试请求 API 获得摘要信息", summaryContent); // debug use

        await kv.set(reqBody.postId, summaryContent.choices[0].message.content);

        res.status(200).json({
          code: 1,
          message: "处理文章摘要成功",
          data: summaryContent.choices[0].message.content,
        });
        return;
      } else {
        res.status(200).json({
          code: 1,
          message: "处理文章摘要成功",
          data: summaryKV,
        });

        return;
      }
    } catch (error) {
      res.status(500).json({
        code: -1,
        message: `处理文章摘要失败: ${error}`,
      });
      console.log("🤤 Catch error", error);
    }
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: `服务器错误: ${error}`,
    });
    console.log("🤤 Catch error", error);
  }
};
