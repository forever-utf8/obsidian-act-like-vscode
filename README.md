# Act Like VSCode

An Obsidian desktop plugin that brings VS Code tab behavior and visual file-state cues to the file explorer.

## Features

**VS Code-style tabs**

Single-click a note in the file explorer to open it as a preview tab. Double-click the note or its tab header to pin it. The preview slot holds one tab at a time and replaces it on the next single-click.

**File explorer coloring**

Files and folders are colored by tag state. Unarchived notes appear in green; notes tagged with the archive tag switch to gray (or a color you configure). Folders containing unarchived notes are also highlighted in green. Tab titles mirror the same color shown in the file explorer.

**Tag badges**

Configured tags render as small inline badges next to each file name in the explorer, so you can see a file's tags without opening it.

**Navigation icons**

File and folder entries in the explorer each get a small icon. Folders show different icons when collapsed versus expanded. The icon color follows the entry's text color. Icons can be turned off in settings.

## Settings

Open *Settings → Act Like VSCode* to configure:

- **Tags** — add or remove tags (up to 8). Each tag gets a color used for both the file name and its badge. The first entry ("归档") is the archive tag and cannot be renamed.
- **Navigation icons** — toggle file and folder icons on or off.

## Bundled CSS Snippet

`snippets/style.css` is a standalone Notion-style CSS snippet. Copy it to `.obsidian/snippets/` and enable it in *Settings → Appearance → CSS snippets*.

It applies: custom fonts (Microsoft YaHei + Maple Mono NF CN), warm-colored H1–H6 hierarchy, compact spacing with a single `--indent-width` token, priority-colored inline tags (`#urgent` / `#important` etc.), gold-border checkboxes, and checked tasks auto-sorted to the bottom of lists (Reading View only).

![Snippet preview](https://github.com/user-attachments/assets/84fab561-2ff7-407d-a593-80fa7e53f810)

## Requirements

Obsidian desktop `1.8.9` or newer.

## Development

```bash
npm install   # install dependencies
npm run build # type-check + production bundle
```
