# Obsidian Plugin Template

消灭重复劳动，把创意变成 Obsidian 插件。

有了一个 Obsidian 插件的好点子，却不想花几个小时搭构建工具链、配 TypeScript、搞 vault 集成？这套工具提供了一个**零配置 CLI**，一分钟生成生产就绪的插件项目——TypeScript + Vite 8 + ESLint + 一键热更新开发，你只管写代码。

## 包说明

| 包                                                  | 说明                                                  |
| --------------------------------------------------- | ----------------------------------------------------- |
| [`@gaorun/create-obsidian-plugin`](./packages/cli/) | 脚手架 CLI — 回答几个问题，得到一个能直接跑的插件项目 |
| [`packages/template/`](./packages/template/)        | 驱动 CLI 的模板（不需要直接使用）                     |

---

## 快速开始

### 环境要求

- **Node.js** >= 22.13
- **pnpm** >= 9
- **Obsidian CLI** — Obsidian 桌面应用自带（`/usr/local/bin/obsidian`）。
  安装 [Obsidian](https://obsidian.md) 后 CLI 即可用。

### 注册表配置

本包发布在 GitHub Packages 上。在 `~/.npmrc` 中添加以下内容：

```ini
@gaorun:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxx
```

将 `ghp_xxxxxxxxxxxx` 替换为你的 GitHub 令牌（需要 `read:packages` 权限），[点此创建](https://github.com/settings/tokens)。

### 创建一个插件

```bash
npx --registry https://npm.pkg.github.com @gaorun/create-obsidian-plugin@latest
```

按提示输入：

1. **插件名称** — 如 `我的同步助手`
2. **插件描述** — 你的插件做什么
3. **作者** — 你的名字（默认从 `git config` 读取）
4. **作者邮箱** — 你的邮箱（默认从 `git config` 读取）

插件 ID 自动从名称生成（kebab-case 格式）。项目创建在当前目录下的同名文件夹中。

> **想跳过交互？** 用命令行参数一步到位：
>
> ```bash
> npx --registry https://npm.pkg.github.com @gaorun/create-obsidian-plugin@latest \
>   --name "My Todoist Sync" \
>   --description "Syncs tasks between Obsidian and Todoist" \
>   --author "Jane Doe" \
>   --email "jane@example.com"
> ```

---

## 开发工作流

```bash
cd my-plugin
pnpm run dev
```

Vite 启动监听模式。每次保存源文件：

1. Vite 自动重新构建到 `dist/`
2. 插件**自动复制**到你的 Obsidian vault
3. Obsidian **热更新**插件——无需手动刷新

### 其他命令

| 命令               | 作用                                            |
| ------------------ | ----------------------------------------------- |
| `pnpm run build`   | 生产构建（压缩、无 sourcemap）→ `dist/main.js`  |
| `pnpm run deploy`  | 将当前 `dist/` 复制到 vault 插件目录            |
| `pnpm run clear`   | 从 vault 移除插件，删除本地 `dist/`             |
| `pnpm run lint`    | ESLint 检查（含 Obsidian 专用规则）             |
| `pnpm run version` | 同步版本号到 `manifest.json` 和 `versions.json` |

---

## 项目结构

```
my-plugin/
├── src/
│   ├── main.ts              # 插件入口——在这里添加命令、事件、设置
│   └── settings.ts          # 设置界面和设置选项卡 UI
├── scripts/
│   ├── deploy.mjs           # 将构建产物复制到 vault
│   └── clear.mjs            # 从 vault 移除插件
├── manifest.json            # 插件元数据（id、name、version、author）
├── vite.config.ts           # 构建配置 + 自动部署插件
├── eslint.config.mts        # Obsidian 专用 ESLint 规则
├── tsconfig.json            # TypeScript 配置
└── styles.css               # 插件样式（可选）
```

---

## 发布插件

1. 修改 `manifest.json` 中的 `version`
2. 运行 `pnpm run version` 同步 `versions.json`
3. 运行 `pnpm run build` 确认生产构建正常
4. 提交并推送到 GitHub
5. 创建 GitHub Release，标签用版本号（不加 `v` 前缀）
6. 上传 `main.js`、`manifest.json`、`styles.css`
7. （可选）[提交到社区插件列表](https://github.com/obsidianmd/obsidian-releases)

---

## 给 AI 代理

面向 AI 编码助手的[完整开发指南](https://gaorun.github.io/obsidian-plugin-template/AI-GUIDE)已发布在 GitHub Pages 上，AI 可以照着它一步步创建、开发、发布 Obsidian 插件。

---

## 环境要求

| 工具         | 版本                                |
| ------------ | ----------------------------------- |
| Node.js      | >= 22.13                            |
| pnpm         | >= 11.x                             |
| Obsidian CLI | latest（`npm install -g obsidian`） |
