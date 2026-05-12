# AI 图像与视频生成聚合网站

这是一个基于 React + TypeScript + Tailwind CSS 构建的 AI 生成工具聚合前端项目。

## 🚀 快速启动

按照以下步骤在本地运行项目：

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **浏览器预览**
   打开浏览器访问 [http://localhost:5173](http://localhost:5173)

## 🛠 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **路由**: React Router DOM

## ✨ 主要功能

- **AI 绘画 (/image)**
  - 支持提示词输入（带字数限制提醒）。
  - 可选择生成比例（1:1, 16:9）。
  - 可选择模型（Stable Diffusion XL/2.1）。
  - 模拟生成效果，支持下载生成的图片。
- **AI 视频 (/video)**
  - 支持提示词输入。
  - 可选择视频长度（2s, 4s, 6s）。
  - 模拟视频生成，内置播放器播放及下载功能。
- **UI 设计**
  - 深色科技感主题（#0F111A）。
  - 玻璃态（Glassmorphism）卡片布局。
  - 全局青蓝色（Cyan）高亮配色。
  - 响应式布局与流畅的切换动画。

## 📂 目录结构

```text
├── src/
│   ├── components/       # 公共组件 (NavBar, Spinner)
│   ├── pages/            # 页面组件 (ImagePage, VideoPage)
│   ├── App.tsx           # 路由配置
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式与 Tailwind 配置
├── tailwind.config.js    # Tailwind 配置文件
├── vite.config.ts        # Vite 配置文件
└── package.json          # 项目依赖与脚本
```

## 📝 说明

本项目为纯前端展示原型，生成功能通过模拟延迟实现，图片与视频使用占位资源。下载功能已完整实现，可直接保存资源到本地。
