const backendUrl = "http://localhost:3000"; // 你的后端 URL
const contentCursor = document.getElementById("main-content"); // 内容选择器
const outputCursor = document.getElementById("ai-output"); // 内容输出框选择器

// 获取 postId 和 content
const url = new URL(window.location.href);
const postId = url.pathname.split("/").pop();
const content = contentCursor.textContent;

// 处理 backendUrl 可能以 / 结尾的情况
const apiUrl = backendUrl.endsWith("/")
  ? `${backendUrl}api/summary`
  : `${backendUrl}/api/summary`;

// 构建请求体
const requestBody = {
  postId: postId,
  content: content,
};

// 光标效果
function addCursor(type) {
  if (type) {
    const cursorSpan = document.createElement("span");
    cursorSpan.className = "ai-cursor";
    outputCursor.appendChild(cursorSpan);
  } else {
    const outputCursor = document.getElementsByClassName("ai-cursor");
    outputCursor.removeChild(cursorSpan);
  }
}

// 发起 POST 请求
fetch(`${apiUrl}?postId=${postId}`, {
  method: "GET",
})
  .then((response) => response.json())
  .then((data) => {
    if (data.isSave) {
      // 存入摘要
      summaryData = data.data;
      // 成功，模拟打字效果
      inputSummary(data.data);
    } else {
      // 如果 isSave 为 false，发送 POST 请求
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code === 1) {
            // 存入摘要
            summaryData = data.data;
            // 成功，模拟打字效果
            const outputElement = outputCursor;
            const text = data.data;
            let index = 0;

            const typeWriter = () => {
              if (index < text.length) {
                outputElement.textContent += text.charAt(index);
                index++;
                addCursor(true);
                setTimeout(typeWriter, 100); // 调整打字速度
              } else {
                document.querySelector(".ai-cursor")?.remove(); // 移除光标
              }
            };

            typeWriter();
          } else {
            // 客户端错误，输出响应内容
            console.error("Error:", data);
          }
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    }
  })
  .catch((error) => {
    console.error("Fetch error:", error);
  });
