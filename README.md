# 🦊 FoxAI Gemini 2.5 PlayGround
# 🦊 FoxAI Gemini 2.5 游乐场

# [English Version](README_EN.MD)

### 作者：foxai
基于技术爬爬虾项目深度定制，增加FoxAI品牌化、多语言支持、现代化UI设计和MCP工具扩展功能

## 🌟 项目简介
#### Demo: [https://play.210718.xyz](https://play.210718.xyz)

这是一个功能强大的Gemini 2.5多模态对话平台，专为移动端优化，具有以下特色：

### ✨ FoxAI 增强功能
- 🦊 **FoxAI品牌化**: 专业的品牌标识和动画效果
- 🌍 **多语言支持**: 支持中文、英语、德语、法语四种界面语言
- 🎨 **现代化UI**: 玻璃拟态设计，渐变效果，流畅动画
- 🔧 **MCP工具系统**: 可配置的工具管理，支持扩展功能
- 📱 **移动端优先**: 专为移动设备优化，完美支持手机和平板设备
- ✨ **触摸友好**: 50px+触摸目标，优化的手势交互体验

### 🚀 核心功能
- 🎤 **语音对话**: 实时语音输入输出
- 📹 **视频交互**: 摄像头和屏幕共享支持
- 💬 **文本聊天**: 智能文本对话
- 🔍 **工具集成**: Google搜索、天气查询等扩展工具
- 🌐 **双连接模式**: API Pool和WebSocket两种连接方式
- 🎯 **实时响应**: 低延迟的实时交互体验
- 📱 **移动优化**: 专为移动设备设计的交互体验


## Deno部署（推荐）

0. 准备一个Gemini API Key [https://aistudio.google.com](https://aistudio.google.com)（免费）
1. [fork](https://github.com/tech-shrimp/gemini-playground/fork)本项目
2. 登录/注册 https://dash.deno.com/
3. 创建项目 https://dash.deno.com/new_project
4. 选择此项目，填写项目名字（请仔细填写项目名字，关系到自动分配的域名）
5. Entrypoint 填写 `src/deno_index.ts` 其他字段留空 
   <details>
   <summary>如图</summary>
   
   ![image](/docs/images/1.png)
   </details>
6. 点击 <b>Deploy Project</b>
7. 部署成功后获得域名，点开即用。域名同样可以作为Chat API的代理使用。

## Cloudflare Worker 部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tech-shrimp/gemini-playground)

0. 准备一个Gemini API Key [https://aistudio.google.com](https://aistudio.google.com)（免费）
1. 点击部署按钮
2. 登录Cloudflare账号
3. 填入Account ID，与API Token
4. Fork本项目，开启Github Action功能
5. 部署，打开dash.cloudflare.com，查看部署后的worker
6. 国内使用需要绑定一个自定义域名
   <details>
   <summary>如图</summary>
   
   ![image](/docs/images/3.png)
   </details>
> 国内使用cloudflare有时候可能出现400: User location is not supported for the API use. 可能是粤港地区Cloudflare路由到了香港的CDN节点代理导致的。建议换成Deno部署。

## 本地调试

Windows 安装Deno:
> irm https://deno.land/install.ps1 | iex

Mac/Linux 安装Deno:
> curl -fsSL https://deno.land/install.sh | sh

启动项目：

>cd 项目目录 <br>
>deno run --allow-net --allow-read src/deno_index.ts


## 📱 移动端特性

### 🎯 移动优先设计
- **响应式布局**: 完美适配各种屏幕尺寸，从小屏手机到大屏平板
- **触摸优化**: 50px+触摸目标，超越标准的44px，更易点击
- **手势支持**: 流畅的滑动和点击交互，支持iOS和Android手势
- **性能优化**: 硬件加速动画，60fps流畅体验，优化电池消耗

### 📐 界面适配
- **智能布局**: 竖屏/横屏自动适配，动态调整元素大小
- **键盘适配**: 虚拟键盘弹出时的智能布局调整，防止遮挡
- **安全区域**: 完美支持iOS刘海屏、Dynamic Island和Android导航栏
- **字体优化**: 16px字体防止iOS自动缩放，确保最佳可读性

### 🎨 视觉增强
- **增强玻璃拟态**: 25px模糊效果，更强的视觉层次感
- **FoxAI橙色主题**: 专业的品牌色彩，渐变按钮设计
- **流畅动画**: 优化的过渡效果和微交互，支持硬件加速
- **高对比度**: 确保在强光和弱光环境下的完美可读性

### 🔧 功能优化
- **完美按钮对齐**: Connect和Show Logs按钮精确水平对齐
- **粘性输入**: 输入框固定在底部，支持iOS安全区域
- **智能触摸反馈**: 无高亮点击效果，原生应用般的体验
- **快速访问**: 一键启用音频和视频功能，大按钮易操作
- **🔧 可视化工具管理**: MCP工具配置界面，专为触摸优化

## 🎯 使用方法

### 🌍 语言切换
1. 点击设置按钮（⚙️）
2. 在"UI Language"下拉菜单中选择您的语言
3. 界面将立即切换到所选语言
4. 语言偏好会自动保存

### 🔧 MCP工具管理
1. 点击扩展按钮（🧩）打开工具管理器
2. 在"Tools"标签页查看所有可用工具
3. 使用开关启用/禁用工具
4. 在"Categories"标签页按类别浏览工具
5. 在"Settings"标签页导入/导出配置

### 💬 多模态对话
填入API Key, 点击Connect按钮即可对话。
以下三个按钮分别是：
- 🎤 启用麦克风（语音输入）
- 📹 启用摄像头（视频交互）
- 🖥️ 分享屏幕（屏幕共享）

<details>
   <summary>界面截图</summary>

   ![image](/docs/images/2.png)
</details>


### API 代理
API已经被代理为OpenAI格式，可以直接使用OpenAI格式的API。
不限网络环境，可免梯子使用。
注意替换域名与Gemini API Key。

#### 可用模型列表：
```
curl --location 'http://your.domain.com/v1/models' \
--header 'Authorization: Bearer YOUR-GEMINI-API-KEY'
```

#### 对话:
```
curl --location 'https://your.domain.com/v1/chat/completions' \
--header 'Authorization: Bearer YOUR-GEMINI-API-KEY' \
--header 'Content-Type: application/json' \
--data '{
    "messages": [
        {
            "role": "system",
            "content": "You are a test assistant."
        },
        {
            "role": "user",
            "content": "Testing. Just say hi and nothing else."
        }
    ],
    "model": "gemini-2.5-flash"
}'
```
### ChatBOX：
   <details>
   <summary>如图</summary>
   
   ![image](/docs/images/4.png)
   </details>

### Cursor编程：
   <details>
   <summary>如图</summary>

   ![image](/docs/images/5.png)
   </details>

## 🛠️ 技术特性

### 前端技术栈
- **现代CSS**: 使用CSS Grid、Flexbox、CSS变量
- **玻璃拟态设计**: backdrop-filter实现的现代视觉效果
- **响应式设计**: 移动优先的设计理念
- **模块化架构**: ES6模块化开发
- **国际化系统**: 完整的i18n解决方案

### 移动端适配技术
- **Viewport优化**: 正确的viewport meta标签配置
- **触摸目标**: 符合WCAG标准的44px最小触摸区域
- **字体防缩放**: iOS Safari字体自动缩放防护
- **硬件加速**: GPU加速的CSS动画
- **媒体查询**: 多断点响应式布局
- **横屏适配**: orientation媒体查询优化

### 性能优化
- **懒加载**: 按需加载工具模块
- **事件委托**: 高效的事件处理
- **防抖节流**: 优化用户交互响应
- **内存管理**: 正确的事件监听器清理
- **缓存策略**: localStorage配置持久化

### 可访问性
- **键盘导航**: 完整的键盘操作支持
- **屏幕阅读器**: ARIA标签和语义化HTML
- **颜色对比**: 符合WCAG AA标准的颜色对比度
- **焦点管理**: 清晰的焦点指示器
- **多语言**: 国际化无障碍支持



## 🎉 更新日志

### v2.0.0 - FoxAI增强版
- 🦊 添加FoxAI品牌化设计和动画效果
- 🌍 实现完整的多语言支持系统（中英德法）
- 🎨 全新的现代化UI设计，采用玻璃拟态风格
- 🔧 MCP工具配置系统，支持可视化工具管理
- 📱 完美的移动端适配和响应式设计
- ⚡ 性能优化和用户体验提升

### 移动端适配亮点
- **多断点响应式**: 768px、480px断点优化
- **横屏模式**: 专门的landscape模式适配
- **触摸优化**: 44px最小触摸目标
- **iOS兼容**: 防止字体自动缩放
- **Android优化**: 完美的Material Design适配
- **PWA就绪**: 支持添加到主屏幕

## 🙏 致谢/引用

### FoxAI增强开发
```
Author: FoxAI Team
Enhancement: Multi-language, Modern UI, MCP Tools, Mobile Optimization
Features: Brand design, Responsive layout, Tool management system
```

### 原始项目基础
网站UI基础：
```
Author: ChrisKyle
Project: https://github.com/ViaAnthroposBenevolentia/gemini-2-live-api-demo
MIT License : https://github.com/ViaAnthroposBenevolentia/gemini-2-live-api-demo/blob/main/LICENSE
```

Gemini转OpenAI格式：
```
Author: PublicAffairs
Project: https://github.com/PublicAffairs/openai-gemini
MIT License : https://github.com/PublicAffairs/openai-gemini/blob/main/LICENSE
```

### 技术栈致谢
- **Google Fonts**: Material Symbols图标字体
- **CSS Grid & Flexbox**: 现代布局技术
- **ES6 Modules**: 模块化JavaScript架构
- **Web APIs**: MediaDevices, WebRTC等现代Web API

---

**🦊 Powered by FoxAI** - 让AI更智能，让体验更美好
