# DeepSeek Harness 自由对话插件 (无需选择项目)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-Plugin-blueviolet.svg)](https://github.com/deepseek-ai/deepseek-harness)

模仿 **Codex** 与 **Claude 桌面端**，为 DeepSeek Harness 提供**无需选择或绑定任何本地项目文件夹**即可随时开启对话的能力。

---

## 解决的痛点

在原本的 DeepSeek Harness 中：
1. **强制绑定工作区**：必须先在本地选择或新建一个项目文件夹（Workspace）才能开始对话；
2. **空白页锁定输入**：未选择工作区时，界面停留在“选择工作区”卡片，底部输入框处于禁用状态（提示 `请先选择工作区`），无法直接输入；
3. **日常交流不便**：即使已有项目，所有新会话都必须绑定在某个项目文件夹下，无法进行纯粹的自由问答、概念咨询或临时草稿。

---

## 核心特性

- 💬 **开箱即用，即开即聊（类似 Claude 桌面端）**  
  启动 Harness 时若未选择工作区，插件会自动将主会话就绪，底部输入框直接解锁激活，光标自动聚焦，开箱即聊。
- 📌 **侧边栏常驻入口**  
  侧边栏左下角（设置按钮旁）常驻「自由对话」操作按钮，无论当前停留在哪个工作区，点击即可新建无项目对话。
- 🚀 **空白页直达卡片**  
  在主界面空白页展示显眼的「Claude & Codex 模式」快捷卡片，一键直达，告别繁琐的文件选择弹窗。
- ⌨️ **全局快捷键**  
  支持 `Ctrl+Alt+N`（macOS 上为 `Cmd+Alt+N`），在任何页面或编辑区域随时一键唤起独立对话。
- 🛡️ **安全沙盒临时区（Scratchpad）**  
  自动在用户根目录建立 `~/.dsh/scratchpad` 独立目录。当您在自由对话中让 AI 执行代码或生成临时文件时，拥有合法的安全沙盒工作空间，绝不污染您的真实项目代码。
- 📁 **历史自动归档到“未分组”**  
  自由对话结束后，妥善保存在侧边栏的“未分组（Ungrouped）”独立会话列表中，支持重命名、搜索、归档、置顶与批量管理。

---

## 安装方法

本插件属于 DeepSeek Harness 本地 Bundle 插件：

1. 克隆或下载本仓库到本地目录，例如：
   ```bash
   git clone https://github.com/WuTianYu-wty/dsh-plugin-standalone-chat.git
   ```

2. 在 DeepSeek Harness 中，向 Agent 发送指令或通过插件管理器进行安装：
   ```
   安装本地插件包：<插件绝对路径>
   ```
   *或在 Agent 会话中调用 `plugin_manager` 工具安装。*

3. 安装完成后，刷新网页或桌面端窗口（`F5` 或 `Ctrl+R` / `Cmd+R`），即可看到左下角「自由对话」按钮与全新空白页卡片。

---

## 快捷键一览

| 操作 | Windows / Linux | macOS |
|---|---|---|
| 新建自由对话（无需项目） | `Ctrl + Alt + N` | `Cmd + Alt + N` |

---

## 开源协议

本项目基于 [MIT License](LICENSE) 开源。
