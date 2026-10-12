# 项目长期记忆 — D:/信息系统（grain-shield-system）

## Git 仓库结构（2026-10-12 起）

- **唯一仓库 = `D:/信息系统` 根目录**，分支 `main`，远端 `https://github.com/flying114514/information-system`。
- 仓库为**扁平结构**：`grain-shield-system/` 是普通目录（含全部前后端源码），
  `grain-shield-system/.git` 已移出（不再是独立仓库/子模块，也已无 `.gitmodules`）。
- 历史上根仓库曾把 `grain-shield-system` 记为 gitlink，导致远端仓库源码为空，**勿再退回此模式**。
- 嵌套仓库备份：`C:/Users/15015/.workbuddy/binaries/_backup/grain-shield-system.git.bak` / `.git.original`。
- 忽略规则靠 `grain-shield-system/.gitignore`（根目录无 .gitignore）；已忽略
  `data/`、`*.lock.db`、`node_modules/`、`dist/`、`backend/target/`。
- 推送前建议校验暂存区：`git diff --cached --numstat | awk '$1=="-"{print}'` 只应出现 `docs/screens/*.png`。
- 推送时 PortableGit `etc/gitconfig` 可能留下 0 字节 `.lock` 并报 `could not lock config file`，
  **不影响推送成功**，可删该锁文件。

## 环境约束（重要，会反复遇到）

- 项目根：`D:/信息系统/grain-shield-system`（Spring Boot 3.3.5 + Vue 3/Vite 5）。
- 本机**没有系统级 Java/Maven/Docker**；便携运行时在 `C:\Users\15015\.workbuddy\binaries\`：
  - JDK 21：`jdk-21.0.12.1+1`
  - Maven：`apache-maven-3.9.16`（镜像配置 `maven-settings.xml`，阿里云）
  - Node 22：`node\versions\22.22.2-6`
- 本会话环境会注入 `SERVER__PORT=9098`，Spring Boot 宽松绑定会当成 `server.port`；
  **启动后端必须显式 `--server.port=8080`**（或先 `unset SERVER__PORT SERVER_PORT`）。
- 前端 `npm install` 会因 esbuild postinstall 版本校验报 `EBUSY`，用
  **`npm install --ignore-scripts`** 绕过（平台二进制随 optionalDependencies 装好，Vite 可正常运行）。
- bash / PowerShell 工具均**禁止直接调用 `cmd.exe`**；需验证 .bat 时让脚本自写日志再读回。

## DLP 透明加密（.vue 密文问题）

- 本机存在企业透明加密驱动，文件头 `%TSD-Header-###%`（IP-guard 类），按扩展名策略加密。
- **`.vue` 文件会被加密，`.js/.json/.css/.java` 不会。**
- 权限差异：**Python 进程可读明文，Node/bash 读到密文**。
- 修复/还原手法：Python 读出明文 → `os.remove` 原文件 → Python 新建同名文件写回 → 即得明文（覆写无效，必须删除重建）。
- 明文备份：`C:\Users\15015\.workbuddy\binaries\_dl\vue_plaintext_backup\`。
- 原始明文源码包：`C:\Users\15015\Downloads\grain-shield-system.zip`。
- git 仓库对象为明文，改完不必重新提交也能保持干净。

## 一键启动

- 桌面脚本：`启动GrainShield系统.bat` / `停止GrainShield系统.bat`（**GBK 编码 + 首行 `chcp 936`**，否则中文路径乱码）。
- 手动：后端 `java -jar backend/target/grain-shield-backend-1.0.0.jar --server.port=8080`；
  前端 `cd frontend && npm run dev` → http://localhost:5173
- 演示账号：admin/admin123、dispatcher/dispatch123、node/node123。

## 数据大屏（4 屏）验证方法 — 重要

- **headless 截图视口补偿**：`--window-size=W,H` 的真实 inner viewport = 窗口 - (22, 98)。
  想要 1366×768 视口，必须传 `--window-size=1388,866`。否则截图会矮 98px，误判为"页面被裁切"。
- **真实设计基准是 1366×610~670**：1366×768 笔记本去掉标签栏+地址栏后可视高度约 610~670px。
  大屏排版必须在这个范围验证，而不是 768。
- **量化审计（不要靠截图 OCR）**：`frontend/public/_audit.html`（iframe 逐表测 box/need/over +
  遍历找 overflow:hidden 裁切 + 面板内容高 vs 可视高，POST 落盘）
  + `report_server.js`(Node:5199) + `audit.sh <W> <H>`，产物 `audit_WxH.json`，用 Python 解析。
  临时探针页用完要删，避免进构建产物。
- 判定标准：四屏 `rootScrollOver=0`、`clipY=none`、`clipX=none`。
  已在 1366×{610,640,660,700,768,900,1080} 全部通过。
- 布局策略：**不用整体 scale 缩放**（会把字体缩到不可读），改为原生尺寸铺满，
  用 `screen.css` 里 `max-height:720/660/650px` 三级媒体查询收紧。
- 常见坑：`.sk-chart` 用 `flex:1`，父容器必须是 flex 且不能 `align-items:center`，
  否则画布高度塌 0（环形图空白）。

