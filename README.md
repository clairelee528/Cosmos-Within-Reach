# 咫尺星空 | Cosmos Within Reach

咫尺星空是一个结合空间投影、手部追踪、自然手势和 Three.js 3D 内容的互动天文学习原型。V1.0 将提供太阳系八大行星的完整探索总览。

项目希望把墙面或天花板上的宇宙投影变成一个可以直接操作的空间界面。用户将能够指向一颗行星、用捏合手势选择它、旋转或缩放它，并阅读相关的天文知识。

## 当前状态

项目正在进行 V1.0 的十天 MVP 开发。目前已完成基础工程初始化，后续功能会按开发计划逐步加入。

## 技术栈

- HTML5 / CSS3 / JavaScript
- Vite
- Three.js
- MediaPipe Tasks Vision — Hand Landmarker

## 本地运行

首次运行时，在项目文件夹中执行：

```bash
npm install
npm run dev
```

终端会显示一个本地网址，通常为 `http://localhost:5173`。使用 Chrome 或 Edge 打开该网址即可查看项目。

## 生产构建

```bash
npm run build
```

构建成功后，生成的文件会位于 `dist` 文件夹中。该文件夹是自动生成的，不需要提交到 GitHub。

## 项目文档

- [产品需求文档](./PRD_V1.0_Cosmos_Within_Reach.md)
- [技术架构](./ARCHITECTURE.md)
- [十天开发计划](./DEVELOPMENT_PLAN_V1.0.md)

## 计划中的核心体验

```text
太阳系总览
→ 指向并悬停行星
→ 捏合选择
→ 旋转和缩放
→ 阅读知识
→ 张开手掌返回
```

在手势功能之外，项目也会保留完整的鼠标备用操作。
