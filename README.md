# DeepSeek Harness Codex 风格项目选择器 (方案A: 不选择项目)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-Plugin-blueviolet.svg)](https://github.com/deepseek-ai/deepseek-harness)

完美复刻 **OpenAI Codex 桌面端** 的作用域选择架构，在 DeepSeek Harness 输入框正上方直接提供 `[📁 选择项目]` 与 `[💻 不选择项目]` 双胶囊按钮，解除工作区目录的强制绑定。

---

## 核心特性

- 🖥️ **Codex 级双胶囊设计（方案 A）**  
  输入框正上方直接并列呈现：
  - `[📁 选择项目 ⌵]`：点击展开完整工作区菜单（如 `对话`、`备忘录`、`+ 添加工作区...`），选中时切换为对应项目名称高亮显示。
  - `[💻 不选择项目]`：点击即进入无项目全局自由对话模式，输入框即刻解锁。
- 💬 **随心输入，开箱即聊**  
  在「不选择项目」模式下，彻底解除 Harness 原生“请先选择工作区”的输入框锁死拦截，输入占位符对齐 Codex 显示为“随心输入”。
- 🛡️ **安全隔离与自动归档**  
  不选择项目时的自由对话自动归档在侧边栏的“未分组（Ungrouped）”独立会话列表中，生成的临时脚本与工具操作落入 `~/.dsh/scratchpad` 独立沙盒，绝不污染您的真实项目代码。
- ⌨️ **全局快捷键**  
  支持 `Ctrl+Alt+N`（macOS 上为 `Cmd+Alt+N`），在任何页面随时一键切回“不选择项目”模式。

---

## 安装与生效

由于本插件已软链接到本地 Harness 桌面端 profile：
只需在桌面端窗口中按下 **`Ctrl+R`**（或 macOS 下 **`Cmd+R`**）重新加载，即可立即看到全新的 Codex 风格双胶囊选择器。

---

## 回归测试

使用 Node.js 执行测试，无需安装第三方依赖：

```sh
npm test
```

测试会在最小 DOM 环境中执行实际的 `client.js`，验证页面更新不会造成
MutationObserver 自触发死循环，并检查按钮节点保持、工作区状态更新及缺失按钮恢复。
若观察器连续触发而无法收敛，测试会在限定轮数内失败，避免测试本身卡死。

---

## 开源协议

本项目基于 [MIT License](LICENSE) 开源。
