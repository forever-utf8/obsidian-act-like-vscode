# Act Like VSCode

[中文](README.md) | English

Make Obsidian work like VS Code.
![Preview](https://github.com/user-attachments/assets/3b056ddd-f149-4fb5-ad75-75723862990d)

## Features

**VS Code-style tabs**

Single-click to preview, double-click to pin.

**File explorer coloring**

Files are highlighted based on archive status.
- Unarchived files appear in green, archived files in gray.
- Folders with unarchived notes appear in green; folders where all notes are archived appear in gray.

**Tag badges**

Tags inside notes are displayed as badges in the file explorer.

**Navigation icons**

Minimal icons for files and folders — simple yet necessary, no overwhelming choices, reducing cognitive load.

## Settings

Open *Settings → Act Like VSCode* to configure:

- **Navigation icons** — toggle file and folder icons on or off.
- **Tags** — includes the "archive" tag by default. Each tag gets a color applied to both the file name and its badge.
![Snippet preview](https://github.com/user-attachments/assets/e4018863-e486-4f8f-a179-7fc2b397e653)

## CSS Snippet

A personal-style snippet, **not tested for compatibility with other themes**.

**Installation**: copy the file to `.obsidian/snippets/` and enable it in *Settings → Appearance → CSS snippets*.

![Snippet preview](https://github.com/user-attachments/assets/53c0f9c3-e689-4b82-9f66-f910f361e12f)

## Requirements

Obsidian desktop `1.8.9` or newer.

## Development

```bash
npm install   # install dependencies
npm run build # type-check + production bundle
```
