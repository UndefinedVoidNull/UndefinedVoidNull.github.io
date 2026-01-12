# PDF Blog
一个以PDF为最终格式, 支持RSS, 使用简单HTML+CSS编写Layout, 执行无依赖的Node.js脚本生成文章条目的静态博客 `PDF Blog`

## Why PDF?
Markdown, LaTeX, Typst, Onenote, Word, Webpages, Epub, Pictures...
每一种格式或编辑器都有其优势和劣势, 但是这些格式或编辑器有一个共同点, 那就是都可以导出或转换为PDF, 而对于大多数人而言博客作为一个重阅读轻交互的场景, 使用PDF作为最终格式是很合适的
音视频可以通过PDF中的链接跳转, 而评论可以使用外站私信或群聊(如TG), 电子邮件或者Github的Discussions实现
当然在MDX和一些博客系统也可以实现在页面内嵌入PDF
但是通过放弃一些绝大多数情况我都不会用到的功能(尽管这些功能可能很fancy), 换取一个更小的心智负担, 更简单, 更稳定的系统对我来说是值得的
 
## Getting Started
1. Clone This Repository
2. 复制或移动PDF文件到 `/pdfs` 目录
3. 执行`build.js`生成文章条目或`deploy.js`生成条目并Push
```bash
node build.js
```

```bash
node deploy.js
```

```
./index.html
```