# Act Like VSCode

[English](README.en.md) | 中文

让 Obsidian 用起来像 VS Code。
![效果预览](https://github.com/user-attachments/assets/3b056ddd-f149-4fb5-ad75-75723862990d)

## 功能

**VS Code 风格的标签页**

单击以预览，双击以固定。

**文件浏览器着色**

文件根据是否归档进行高亮
- 未归档显示为绿色，已归档则为灰色；
- 目录下含有未归档笔记，显示为绿色；目录下笔记全部归档，显示为灰色。

**标签徽章**

文件浏览器同步显示笔记内标签。

**导航栏图标**

极其克制的展示文件/文件夹的图标，简单但必要，没有多余选择，降低心智负担。

## 设置

打开 *设置 → Act Like VSCode* 进行配置：

- **导航栏图标** — 开关文件与文件夹图标。
- **标签** — 默认包含“归档”标签。每个标签一种颜色，同时作用于文件名和徽章。
![效果预览](https://github.com/user-attachments/assets/e4018863-e486-4f8f-a179-7fc2b397e653)

## CSS 片段

个人自用风格片段，**未测试与其他主题兼容性**。

**安装方式**：将文件复制到 `.obsidian/snippets/`，在 *设置 → 外观 → CSS 片段* 中启用。


![效果预览](https://github.com/user-attachments/assets/53c0f9c3-e689-4b82-9f66-f910f361e12f)

## 系统要求

Obsidian 桌面端 `1.8.9` 或更新版本。

## 开发

```bash
npm install   # 安装依赖
npm run build # 类型检查 + 生产构建
```

