export default {
  async fetch(request, env, ctx) {
    const jsonheaders = {
      "content-type": "text/event-stream; charset=utf-8",
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': "*",
      'Access-Control-Allow-Headers': "*",
      'Access-Control-Max-Age': '86400',
    };

    const url = new URL(request.url);
    const query = decodeURIComponent(url.searchParams.get('q'));
    const messages = [
        { role: "system", content: "你是一个文章摘要助手，你会根据用户提供的文章内容返回文章摘要。你只需要直接回答问题，只需要提供给用户文章的摘要内容即可（除非另有说明）。你的输出必须为中文。" },
        { role: "user", content: query }
      ]

    const stream = await env.AI.run('@cf/qwen/qwen1.5-14b-chat-awq', {
      messages,
      stream: true,
    });

    return new Response(stream, { headers: jsonheaders });
  }
}
