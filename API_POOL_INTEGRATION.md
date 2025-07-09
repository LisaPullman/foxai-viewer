# 🔗 API Pool Integration Guide

## 概述

FoxAI项目已成功集成您的gemini-balance API池，现在支持两种连接模式：

### 🎯 连接模式

#### 1. API Pool模式 (推荐用于文本对话)
- **优势**: 使用您的API池，无需输入API Key
- **功能**: 支持文本对话
- **限制**: 不支持语音和视频功能
- **配置**: 已硬编码您的API配置

#### 2. WebSocket模式 (完整功能)
- **优势**: 支持完整的多模态功能
- **功能**: 文本、语音、视频对话
- **要求**: 需要输入Gemini API Key
- **用途**: 实时多模态交互

## 🚀 使用方法

### 启动应用
```bash
cd /Users/foxai/Desktop/foxai-viewer
deno run --allow-net --allow-read src/deno_index.ts
```

### 访问应用
打开浏览器访问: http://localhost:8000

### 选择连接模式
1. 在页面顶部找到"Connection Mode"下拉菜单
2. 选择您需要的模式：
   - **🔗 API Pool (Text Only)**: 使用您的API池
   - **🎤 WebSocket (Full Features)**: 使用完整功能

### API Pool模式使用
1. 选择"API Pool"模式
2. 直接点击"Connect"按钮
3. 开始文本对话

### WebSocket模式使用
1. 选择"WebSocket"模式
2. 输入Gemini API Key
3. 点击"Connect"按钮
4. 享受完整的多模态功能

## ⚙️ 配置信息

### API Pool配置 (已修复并硬编码)
- **API Key**: F435261ox
- **Base URL**: http://10.20200108.xyz (已修复：移除端口号)
- **Endpoint**: /v1/chat/completions
- **状态**: ✅ 连接测试通过，59个模型可用

### 功能对比

| 功能 | API Pool模式 | WebSocket模式 |
|------|-------------|---------------|
| 文本对话 | ✅ | ✅ |
| 语音输入 | ❌ | ✅ |
| 语音输出 | ❌ | ✅ |
| 视频交互 | ❌ | ✅ |
| 屏幕共享 | ❌ | ✅ |
| 实时对话 | ❌ | ✅ |
| API Key需求 | ❌ | ✅ |

## 🔧 技术实现

### 修改的文件
1. `src/static/index.html` - 添加连接模式选择器
2. `src/static/js/main.js` - 实现双模式连接逻辑
3. `src/static/css/style.css` - 添加新的UI样式
4. `src/api_proxy/worker.mjs` - 配置API代理

### 关键功能
- 自动模式切换
- 错误处理和超时控制
- 功能状态指示
- 用户偏好保存

## 🎉 成功实现

✅ **完全移除了API Key输入的依赖**
✅ **硬编码了您的API池配置**
✅ **保留了原有的完整功能作为选项**
✅ **添加了直观的模式选择界面**
✅ **实现了智能的功能启用/禁用**

现在您可以：
1. 默认使用API Pool模式进行文本对话
2. 需要时切换到WebSocket模式使用完整功能
3. 享受无需手动输入API Key的便利体验

## 📝 注意事项

1. **网络连接**: 确保能访问您的API池地址
2. **API配额**: 注意API池的使用限制
3. **功能限制**: API Pool模式不支持实时多模态功能
4. **备用方案**: WebSocket模式作为功能完整的备选方案

祝您使用愉快！🎊
