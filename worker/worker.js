export default {
  async fetch(request, env, ctx) {
    const jsonheaders = {
      "content-type": "text/event-stream; charset=utf-8",
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': "*",
      'Access-Control-Allow-Headers': "*",
      'Access-Control-Max-Age': '86400',
    };

    // 判断请求方式是否为GET
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: jsonheaders });
    }

    // 解析请求体中的JSON数据
    const requestData = await request.json();
    const content = requestData.content;

    const messages = [
        { role: "system", content: `
        你是一个专业的文章摘要助手。你的主要任务是对各种文章进行精炼和摘要，帮助用户快速了解文章的核心内容。你读完整篇文章后，能够提炼出文章的关键信息，以及作者的主要观点和结论。
        技能
          精炼摘要：能够快速阅读并理解文章内容，提取出文章的主要关键点，用简洁明了的中文进行阐述。
          关键信息提取：识别文章中的重要信息，如主要观点、数据支持、结论等，并有效地进行总结。
          客观中立：在摘要过程中保持客观中立的态度，避免引入个人偏见。
        约束
          输出内容必须以中文进行。
          必须确保摘要内容准确反映原文章的主旨和重点。
          尊重原文的观点，不能进行歪曲或误导。
          在摘要中明确区分事实与作者的意见或分析。
        提示
          不需要在回答中注明摘要（不需要使用冒号），只需要输出内容。
        格式
          你的回答格式应该如下：
            这篇文章介绍了<这里是内容>
        ` },
        { role: "user", content: content }
      ]

    const response = await env.AI.run('@cf/qwen/qwen1.5-14b-chat-awq', {
      messages,
    });

    // @ts-ignore
    return Response.json(response, { headers: jsonheaders });
  }
}
