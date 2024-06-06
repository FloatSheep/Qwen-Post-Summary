# Adapter

实践中的适配

## 通用教程

进入博客的文章页面，打开 F12，选择左上角小箭头

![image](https://github.com/FloatSheep/Qwen-Post-Summary/assets/142888681/f71abebb-e703-49a3-a803-c1fe9a922b37)

选中后将光标移到文章标题处，点击，在元素中获取文章 Title

![image](https://github.com/FloatSheep/Qwen-Post-Summary/assets/142888681/da49d737-bf53-49de-b8e4-857115a6e552)

记录下 id（或者 class）

然后再次选择小箭头，将光标移到文章内容容器处，点击，在元素中选择容器（此容器需要包含所有文章内容，且不含非文章内容）

![image](https://github.com/FloatSheep/Qwen-Post-Summary/assets/142888681/b5985c47-290d-477b-9053-04206afbcc60)

记录下 id（或者 class）

将 [README.md][1] 中示例的测试数据改成如下：

```javascript
// 测试数据（方便定位）
const postTitle = document.getElementById("").textContent; // 引号中填写文章 Title 的 id
// 如果你获取的是 class
// const postTitle = document.getElementsByClassName("").textContent; // 引号中填写文章 Title 的 class
const postBeforeContent = document.getElementById("").textContent; // 引号中填写文章内容容器的 id
// 如果你获取的是 class
// const postBeforeContent = document.getElementsByClassName("").textContent; // 引号中填写文章内容容器的 class
```

修改 apiUrl

```javascript
const apiUrl = "" // 这里填写你获得的 API 地址
```

保存到 JS 文件中（这里假设保存在 /js/summary.js）

在主题 / 网页中引入 JS 脚本并添加 HTML 元素

```html
<script src="/js/summary.js" /> <!-- 这里是常规引入方案，可能需要更改（比如 hexo-theme-butterfly 应该在 config.yml 的 inject 中引入 -->
```

```html
<p id="ai-output"></p> <!-- 这里是常规引入方案，放在文章页的顶部（文章内容容器之前）且可能需要更改（比如 hexo-theme-butterfly 应该在文章渲染的源码中使用 p#ai-output -->
```

[1]: </README.md>
