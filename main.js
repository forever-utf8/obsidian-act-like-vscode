"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ActLikeVSCode
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var PREVIEW_ATTR = "data-vsc-preview";
var TAB_HANDLER_ATTR = "data-vsc-handler";
var FILE_STATE_ATTR = "data-vsc-file-state";
var FOLDER_STATE_ATTR = "data-vsc-folder-state";
var TAB_COLOR_ATTR = "data-vsc-tab-color";
var BADGE_CONTAINER_CLASS = "vsc-nav-tag-badges";
var BADGE_CLASS = "vsc-nav-tag-badge";
var BADGE_SIGNATURE_ATTR = "data-vsc-badge-signature";
var FILE_COLOR_PROP = "--vsc-nav-file-color";
var FOLDER_COLOR_PROP = "--vsc-nav-folder-color";
var TAG_COLOR_PROP = "--vsc-nav-tag-color";
var TAB_COLOR_PROP = "--vsc-tab-file-color";
var INLINE_TAG_COLOR_PROP = "--vsc-inline-tag-color";
var ICON_CLASS = "vsc-nav-icon";
var ICON_ATTR = "data-vsc-icon";
var FOLDER_CLOSED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;
var FOLDER_OPEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/><circle cx="14" cy="15" r="1"/></svg>`;
var TEXT_FILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M3 16v-1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V16"/><path d="M6 22h2"/><path d="M7 14v8"/></svg>`;
var CODE_FILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22h4a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M5 14a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1 1 1 0 0 1 1 1v2a1 1 0 0 0 1 1"/><path d="M9 22a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1"/></svg>`;
var IMAGE_FILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
var TEXT_FILE_EXTENSIONS = /* @__PURE__ */ new Set(["md", "markdown", "txt", "text", "org", "rst"]);
var CODE_FILE_EXTENSIONS = /* @__PURE__ */ new Set([
  "js",
  "mjs",
  "cjs",
  "ts",
  "jsx",
  "tsx",
  "py",
  "rb",
  "go",
  "rs",
  "c",
  "cpp",
  "cc",
  "h",
  "hpp",
  "cs",
  "java",
  "php",
  "swift",
  "kt",
  "css",
  "scss",
  "sass",
  "less",
  "html",
  "htm",
  "xml",
  "xhtml",
  "svg",
  "json",
  "jsonc",
  "yaml",
  "yml",
  "toml",
  "sh",
  "bash",
  "zsh",
  "fish",
  "ps1",
  "bat",
  "sql",
  "graphql",
  "gql",
  "vue",
  "svelte",
  "astro",
  "r",
  "lua",
  "dart",
  "ex",
  "exs"
]);
var IMAGE_FILE_EXTENSIONS = /* @__PURE__ */ new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "ico",
  "tiff",
  "tif",
  "avif",
  "heic",
  "heif"
]);
var ARCHIVE_LABEL = "\u5F52\u6863";
var ARCHIVE_TAG = "#\u5F52\u6863";
var UNARCHIVED_COLOR = "var(--color-green, #08b94e)";
var MAX_TAG_CONFIGS = 10;
var MAX_TAG_LABEL_CHARS = 10;
var TAG_COLOR_OPTIONS = [
  { id: "gray", label: "\u7070\u8272", value: "var(--text-muted)", swatch: "#8a8a8a" },
  { id: "red", label: "\u7EA2\u8272", value: "var(--color-red, #e93147)", swatch: "#e93147" },
  { id: "orange", label: "\u6A59\u8272", value: "var(--color-orange, #d9822b)", swatch: "#d9822b" },
  { id: "yellow", label: "\u9EC4\u8272", value: "var(--color-yellow, #e0ac00)", swatch: "#e0ac00" },
  { id: "green", label: "\u7EFF\u8272", value: "var(--color-green, #08b94e)", swatch: "#08b94e" },
  { id: "cyan", label: "\u9752\u8272", value: "var(--color-cyan, #00a3bf)", swatch: "#00a3bf" },
  { id: "blue", label: "\u84DD\u8272", value: "var(--color-blue, #2f80ed)", swatch: "#2f80ed" },
  { id: "purple", label: "\u7D2B\u8272", value: "var(--color-purple, #8b5cf6)", swatch: "#8b5cf6" }
];
var DEFAULT_SETTINGS = {
  tags: [
    {
      name: ARCHIVE_LABEL,
      colorId: "gray"
    }
  ],
  navIcons: true
};
var DEFAULT_TAG_CONFIGS = [
  {
    label: ARCHIVE_LABEL,
    tag: ARCHIVE_TAG,
    color: colorValue("gray"),
    isArchive: true
  }
];
function normalizeTagName(tag) {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}
function normalizeTagLabel(label) {
  return limitTagLabel(label.trim().replace(/^#+/u, ""));
}
function limitTagLabel(label) {
  return Array.from(label).slice(0, MAX_TAG_LABEL_CHARS).join("");
}
function colorValue(colorId) {
  return TAG_COLOR_OPTIONS.find((option) => option.id === colorId)?.value ?? TAG_COLOR_OPTIONS[0].value;
}
function cssStringValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function isTagColorId(value) {
  return TAG_COLOR_OPTIONS.some((option) => option.id === value);
}
function defaultSettings() {
  return {
    tags: DEFAULT_SETTINGS.tags.map((tag) => ({ ...tag })),
    navIcons: DEFAULT_SETTINGS.navIcons
  };
}
var ActLikeVSCode = class extends import_obsidian.Plugin {
  /** The current "preview" leaf — can be replaced by the next single-click. */
  previewLeaf = null;
  settings = defaultSettings();
  tagConfigs = this.buildTagConfigs(this.settings);
  fileStates = /* @__PURE__ */ new Map();
  unarchivedFolderPaths = /* @__PURE__ */ new Set();
  fileExplorerObserver = null;
  fileExplorerSyncFrame = null;
  fileExplorerInitialized = false;
  initialMetadataResolved = false;
  inlineTagStyleEl = null;
  inlineTagObserver = null;
  inlineTagSyncFrame = null;
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  async onload() {
    await this.loadSettings();
    this.syncInlineTagStyles();
    this.addSettingTab(new ActLikeVSCodeSettingTab(this.app, this));
    this.registerDomEvent(document, "click", this.onDocumentClick, true);
    this.registerDomEvent(document, "dblclick", this.onDocumentDblClick, true);
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.syncTabHandlers();
        this.cleanupPreviewLeaf();
        this.scheduleFileExplorerSync();
        this.scheduleInlineTagSync();
      })
    );
    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        this.scheduleInlineTagSync();
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        this.scheduleInlineTagSync();
        if (!leaf || leaf === this.previewLeaf) return;
        if (leaf.view.getViewType() === "empty") {
          this.setAsPreview(leaf);
        }
      })
    );
    this.app.workspace.onLayoutReady(() => {
      this.initializeFileExplorerStyling();
      this.scheduleInlineTagSync();
    });
    this.installInlineTagObserver();
    this.registerInlineTagInteractionEvents();
    this.scheduleInlineTagSync();
    this.syncTabHandlers();
  }
  onunload() {
    this.inlineTagStyleEl?.remove();
    this.inlineTagStyleEl = null;
    this.disconnectInlineTagObserver();
    this.cancelScheduledInlineTagSync();
    this.clearInlineTagDecorations();
    this.disconnectFileExplorerObserver();
    this.cancelScheduledFileExplorerSync();
    this.clearFileExplorerDecorations();
    this.fileStates.clear();
    this.unarchivedFolderPaths.clear();
    document.querySelectorAll(`[${PREVIEW_ATTR}]`).forEach((el) => {
      el.removeAttribute(PREVIEW_ATTR);
    });
    document.querySelectorAll(`[${TAB_COLOR_ATTR}]`).forEach((el) => {
      el.removeAttribute(TAB_COLOR_ATTR);
      el.style.removeProperty(TAB_COLOR_PROP);
    });
  }
  // ── Settings ───────────────────────────────────────────────────────────────
  getTagSettings() {
    return this.settings.tags;
  }
  getColorOptions() {
    return TAG_COLOR_OPTIONS;
  }
  isArchiveTagIndex(index) {
    return index === 0;
  }
  async addTagSetting() {
    if (this.settings.tags.length >= MAX_TAG_CONFIGS) {
      new import_obsidian.Notice(`\u6700\u591A\u53EA\u80FD\u914D\u7F6E ${MAX_TAG_CONFIGS} \u4E2A\u6807\u7B7E\u3002`);
      return false;
    }
    const tags = [...this.settings.tags, { name: "", colorId: "gray" }];
    this.settings = { ...this.settings, tags };
    await this.persistSettings();
    return true;
  }
  async updateTagName(index, name) {
    if (this.isArchiveTagIndex(index)) return;
    const tags = this.settings.tags.map(
      (tag, tagIndex) => tagIndex === index ? { ...tag, name } : tag
    );
    this.settings = this.normalizeSettings({ ...this.settings, tags });
    await this.persistSettings();
  }
  async updateTagColor(index, colorId) {
    if (!isTagColorId(colorId)) return;
    const tags = this.settings.tags.map(
      (tag, tagIndex) => tagIndex === index ? { ...tag, colorId } : tag
    );
    this.settings = this.normalizeSettings({ ...this.settings, tags });
    await this.persistSettings();
  }
  async removeTagSetting(index) {
    if (this.isArchiveTagIndex(index)) return;
    this.settings = this.normalizeSettings({
      ...this.settings,
      tags: this.settings.tags.filter((_tag, tagIndex) => tagIndex !== index)
    });
    await this.persistSettings();
  }
  isNavIconsEnabled() {
    return this.settings.navIcons;
  }
  async setNavIcons(enabled) {
    this.settings = { ...this.settings, navIcons: enabled };
    await this.saveData(this.settings);
    if (!enabled) {
      document.querySelectorAll(`.${ICON_CLASS}`).forEach((el) => el.remove());
    } else {
      this.scheduleFileExplorerSync();
    }
  }
  async loadSettings() {
    this.settings = this.normalizeSettings(await this.loadData());
    this.tagConfigs = this.buildTagConfigs(this.settings);
  }
  async persistSettings() {
    await this.saveData(this.settings);
    this.tagConfigs = this.buildTagConfigs(this.settings);
    this.syncInlineTagStyles();
    this.scheduleInlineTagSync();
    this.rebuildFileStatusIndex();
    this.scheduleFileExplorerSync();
  }
  normalizeSettings(data) {
    const raw = typeof data === "object" && data !== null ? data : {};
    const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
    const archiveTag = this.normalizeArchiveTag(rawTags[0]);
    const customTags = rawTags.slice(1, MAX_TAG_CONFIGS).filter((tag) => this.isStoredTagConfig(tag)).map((tag) => ({
      name: normalizeTagLabel(tag.name),
      colorId: tag.colorId
    }));
    const navIcons = typeof raw.navIcons === "boolean" ? raw.navIcons : true;
    return {
      tags: [archiveTag, ...customTags].slice(0, MAX_TAG_CONFIGS),
      navIcons
    };
  }
  isSettingsLike(data) {
    return typeof data === "object" && data !== null && "tags" in data;
  }
  isStoredTagConfig(data) {
    if (typeof data !== "object" || data === null) return false;
    const record = data;
    return typeof record.name === "string" && isTagColorId(record.colorId);
  }
  normalizeArchiveTag(data) {
    if (this.isStoredTagConfig(data)) {
      return {
        name: ARCHIVE_LABEL,
        colorId: data.colorId
      };
    }
    return {
      name: ARCHIVE_LABEL,
      colorId: "gray"
    };
  }
  buildTagConfigs(settings) {
    const usedTags = /* @__PURE__ */ new Set();
    return settings.tags.flatMap((tag, index) => {
      const label = this.isArchiveTagIndex(index) ? ARCHIVE_LABEL : normalizeTagLabel(tag.name);
      const normalizedTag = normalizeTagName(label);
      if (!normalizedTag || usedTags.has(normalizedTag)) return [];
      usedTags.add(normalizedTag);
      return [
        {
          label,
          tag: normalizedTag,
          normalizedTag,
          color: colorValue(tag.colorId),
          isArchive: this.isArchiveTagIndex(index)
        }
      ];
    });
  }
  archiveTagConfig() {
    const archiveConfig = this.tagConfigs.find((config) => config.isArchive);
    if (archiveConfig) return archiveConfig;
    return {
      ...DEFAULT_TAG_CONFIGS[0],
      normalizedTag: normalizeTagName(DEFAULT_TAG_CONFIGS[0].tag)
    };
  }
  nextTagName() {
    const names = new Set(this.settings.tags.map((tag) => tag.name));
    let suffix = this.settings.tags.length;
    while (names.has(`\u65B0\u6807\u7B7E${suffix}`)) {
      suffix += 1;
    }
    return `\u65B0\u6807\u7B7E${suffix}`;
  }
  // ── File-explorer event interception ──────────────────────────────────────
  /**
   * Single click: open immediately, no timer delay.
   * When part of a double-click the second click is effectively a no-op
   * (file is already open → just focuses), and the dblclick handler pins it.
   */
  onDocumentClick = (e) => {
    const file = this.fileFromEvent(e);
    if (!file) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    void this.handleSingleClick(file);
  };
  /**
   * Double click: the browser fires click→click→dblclick in sequence.
   * By the time dblclick fires the file is already open (from the first click),
   * so we only need to pin the existing leaf.
   */
  onDocumentDblClick = (e) => {
    const file = this.fileFromEvent(e);
    if (!file) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    void this.handleDoubleClick(file);
  };
  // ── Click handlers ─────────────────────────────────────────────────────────
  /**
   * Single-click: VS Code preview behaviour.
   * - If the file is already open somewhere, just focus that leaf.
   * - Otherwise open in the current preview leaf (replacing its content),
   *   or create a new tab and mark it as preview.
   */
  async handleSingleClick(file) {
    const { existing, previewAlive } = this.gatherLeafInfo(file);
    if (existing) {
      this.app.workspace.setActiveLeaf(existing, { focus: true });
      return;
    }
    if (this.previewLeaf && previewAlive) {
      const leaf = this.previewLeaf;
      await leaf.openFile(file);
      this.applyPreviewStyle(leaf, true);
      this.app.workspace.setActiveLeaf(leaf, { focus: true });
    } else {
      const leaf = this.app.workspace.getLeaf("tab");
      await leaf.openFile(file);
      this.setAsPreview(leaf);
    }
  }
  /**
   * Double-click: pin whatever leaf already has the file open.
   * (The two preceding click events have already opened the file as preview.)
   */
  async handleDoubleClick(file) {
    const { existing, previewAlive } = this.gatherLeafInfo(file);
    if (existing) {
      if (this.previewLeaf === existing) this.clearPreview();
      this.app.workspace.setActiveLeaf(existing, { focus: true });
      return;
    }
    if (this.previewLeaf && previewAlive) {
      const leaf = this.previewLeaf;
      await leaf.openFile(file);
      this.clearPreview();
    } else {
      const leaf = this.app.workspace.getLeaf("tab");
      await leaf.openFile(file);
    }
  }
  // ── Tab double-click: convert preview → pinned ───────────────────────────
  syncTabHandlers() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const tabEl = this.tabHeaderEl(leaf);
      if (!tabEl || tabEl.getAttribute(TAB_HANDLER_ATTR)) return;
      tabEl.setAttribute(TAB_HANDLER_ATTR, "true");
      tabEl.addEventListener(
        "dblclick",
        (e) => {
          e.stopImmediatePropagation();
          e.preventDefault();
          if (this.previewLeaf === leaf) this.clearPreview();
        },
        true
        /* capture */
      );
    });
  }
  // ── Preview-state helpers ──────────────────────────────────────────────────
  setAsPreview(leaf) {
    if (this.previewLeaf && this.previewLeaf !== leaf) {
      this.applyPreviewStyle(this.previewLeaf, false);
    }
    this.previewLeaf = leaf;
    this.applyPreviewStyle(leaf, true);
  }
  clearPreview() {
    if (!this.previewLeaf) return;
    this.applyPreviewStyle(this.previewLeaf, false);
    this.previewLeaf = null;
  }
  applyPreviewStyle(leaf, preview) {
    const tabEl = this.tabHeaderEl(leaf);
    if (!tabEl) return;
    if (preview) {
      tabEl.setAttribute(PREVIEW_ATTR, "");
    } else {
      tabEl.removeAttribute(PREVIEW_ATTR);
    }
  }
  // ── File-explorer tag state ────────────────────────────────────────────────
  initializeFileExplorerStyling() {
    if (this.fileExplorerInitialized) return;
    this.fileExplorerInitialized = true;
    this.registerFileStatusEvents();
    this.rebuildFileStatusIndex();
    this.installFileExplorerObserver();
    this.syncFileExplorerDecorations();
  }
  registerFileStatusEvents() {
    this.registerEvent(
      this.app.metadataCache.on("changed", (file, _data, cache) => {
        this.updateFileState(file, cache);
        this.recalculateFolderStates();
        this.scheduleFileExplorerSync();
      })
    );
    this.registerEvent(
      this.app.metadataCache.on("deleted", (file) => {
        this.fileStates.delete(file.path);
        this.recalculateFolderStates();
        this.scheduleFileExplorerSync();
      })
    );
    this.registerEvent(
      this.app.metadataCache.on("resolved", () => {
        if (!this.initialMetadataResolved) {
          this.initialMetadataResolved = true;
          this.rebuildFileStatusIndex();
        }
        this.scheduleFileExplorerSync();
      })
    );
    this.registerEvent(
      this.app.vault.on("create", (file) => this.handleVaultCreate(file))
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => this.handleVaultDelete(file))
    );
    this.registerEvent(
      this.app.vault.on(
        "rename",
        (file, oldPath) => this.handleVaultRename(file, oldPath)
      )
    );
  }
  rebuildFileStatusIndex() {
    this.fileStates.clear();
    this.app.vault.getMarkdownFiles().forEach((file) => {
      this.updateFileState(file);
    });
    this.recalculateFolderStates();
  }
  updateFileState(file, cache = this.app.metadataCache.getFileCache(file)) {
    if (!this.isMarkdownFile(file)) {
      this.fileStates.delete(file.path);
      return;
    }
    const matchResult = this.matchConfiguredTags(cache);
    this.fileStates.set(file.path, {
      matches: matchResult.visibleMatches,
      color: matchResult.archiveMatch?.color ?? UNARCHIVED_COLOR,
      hasArchiveTag: matchResult.hasArchiveTag
    });
  }
  matchConfiguredTags(cache) {
    const visibleMatches = [];
    const seenConfigTags = /* @__PURE__ */ new Set();
    let archiveMatch = null;
    let lastNonArchiveMatch = null;
    let hasArchiveTag = false;
    const archiveTag = this.archiveTagConfig().normalizedTag;
    this.orderedTagsFromCache(cache).forEach((rawTag) => {
      const normalizedTag = normalizeTagName(rawTag);
      if (!normalizedTag) return;
      if (this.tagMatchesConfig(normalizedTag, archiveTag)) {
        hasArchiveTag = true;
      }
      const config = this.findBestTagConfig(normalizedTag);
      if (!config) return;
      const match = {
        label: config.label,
        normalizedTag: config.normalizedTag,
        color: config.color,
        isArchive: config.isArchive
      };
      if (config.isArchive) {
        archiveMatch = match;
      } else {
        lastNonArchiveMatch = match;
      }
      if (config.isArchive) return;
      if (seenConfigTags.has(config.normalizedTag)) return;
      seenConfigTags.add(config.normalizedTag);
      visibleMatches.push(match);
    });
    return {
      visibleMatches,
      archiveMatch,
      lastNonArchiveMatch,
      hasArchiveTag
    };
  }
  orderedTagsFromCache(cache) {
    if (!cache) return [];
    const tags = [];
    tags.push(...this.frontmatterTags(cache));
    tags.push(
      ...(cache.tags ?? []).toSorted((a, b) => this.compareTagPosition(a, b)).map((tag) => tag.tag)
    );
    return tags;
  }
  frontmatterTags(cache) {
    const frontmatter = cache.frontmatter;
    return this.tagsFromUnknown(frontmatter?.tags);
  }
  tagsFromUnknown(value) {
    if (typeof value === "string") {
      return value.split(/[\s,]+/u).map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    }
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.tagsFromUnknown(item));
    }
    return [];
  }
  compareTagPosition(a, b) {
    return a.position.start.offset - b.position.start.offset;
  }
  findBestTagConfig(normalizedTag) {
    let bestConfig = null;
    this.tagConfigs.forEach((config) => {
      if (!this.tagMatchesConfig(normalizedTag, config.normalizedTag)) return;
      if (!bestConfig || config.normalizedTag.length > bestConfig.normalizedTag.length) {
        bestConfig = config;
      }
    });
    return bestConfig;
  }
  tagMatchesConfig(actualTag, configuredTag) {
    return actualTag === configuredTag || actualTag.startsWith(`${configuredTag}/`);
  }
  recalculateFolderStates() {
    this.unarchivedFolderPaths.clear();
    this.fileStates.forEach((state, filePath) => {
      if (state.hasArchiveTag) return;
      this.ancestorFolderPaths(filePath).forEach((folderPath) => {
        this.unarchivedFolderPaths.add(folderPath);
      });
    });
  }
  ancestorFolderPaths(filePath) {
    const folderParts = filePath.split("/").slice(0, -1);
    const paths = [];
    for (let length = folderParts.length; length > 0; length -= 1) {
      paths.push(folderParts.slice(0, length).join("/"));
    }
    return paths;
  }
  handleVaultCreate(file) {
    if (file instanceof import_obsidian.TFile) {
      this.updateFileState(file);
      this.recalculateFolderStates();
    }
    this.scheduleFileExplorerSync();
  }
  handleVaultDelete(file) {
    if (file instanceof import_obsidian.TFile) {
      this.fileStates.delete(file.path);
      this.recalculateFolderStates();
    } else if (file instanceof import_obsidian.TFolder) {
      this.rebuildFileStatusIndex();
    }
    this.scheduleFileExplorerSync();
  }
  handleVaultRename(file, oldPath) {
    if (file instanceof import_obsidian.TFile) {
      this.fileStates.delete(oldPath);
      this.updateFileState(file);
      this.recalculateFolderStates();
    } else if (file instanceof import_obsidian.TFolder) {
      this.rebuildFileStatusIndex();
    }
    this.scheduleFileExplorerSync();
  }
  isMarkdownFile(file) {
    return file.extension.toLowerCase() === "md";
  }
  // ── File-explorer DOM decoration ───────────────────────────────────────────
  installFileExplorerObserver() {
    if (this.fileExplorerObserver) return;
    this.fileExplorerObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => this.shouldSyncForMutation(mutation))) {
        this.scheduleFileExplorerSync();
      }
    });
    this.fileExplorerObserver.observe(this.app.workspace.containerEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-path", "class"]
    });
  }
  disconnectFileExplorerObserver() {
    this.fileExplorerObserver?.disconnect();
    this.fileExplorerObserver = null;
  }
  shouldSyncForMutation(mutation) {
    if (mutation.type === "attributes") {
      if (mutation.attributeName === "class") {
        return mutation.target.classList.contains("nav-folder");
      }
      return true;
    }
    const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
    if (!changedNodes.length) return false;
    return !changedNodes.every((node) => this.isPluginOwnedNode(node));
  }
  isPluginOwnedNode(node) {
    if (!(node instanceof HTMLElement)) return false;
    return node.classList.contains(BADGE_CONTAINER_CLASS) || node.classList.contains(BADGE_CLASS) || node.closest(`.${BADGE_CONTAINER_CLASS}`) !== null || node.classList.contains(ICON_CLASS);
  }
  scheduleFileExplorerSync() {
    if (!this.fileExplorerInitialized || this.fileExplorerSyncFrame !== null) {
      return;
    }
    this.fileExplorerSyncFrame = window.requestAnimationFrame(() => {
      this.fileExplorerSyncFrame = null;
      this.syncFileExplorerDecorations();
    });
  }
  cancelScheduledFileExplorerSync() {
    if (this.fileExplorerSyncFrame === null) return;
    window.cancelAnimationFrame(this.fileExplorerSyncFrame);
    this.fileExplorerSyncFrame = null;
  }
  syncFileExplorerDecorations() {
    document.querySelectorAll(".nav-file-title[data-path]").forEach(
      (titleEl) => this.decorateFileTitle(titleEl)
    );
    document.querySelectorAll(".nav-folder-title[data-path]").forEach((titleEl) => this.decorateFolderTitle(titleEl));
    this.syncTabColors();
  }
  syncTabColors() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const tabEl = this.tabHeaderEl(leaf);
      if (!tabEl) return;
      const file = leaf.view instanceof import_obsidian.FileView ? leaf.view.file : null;
      const state = file ? this.fileStates.get(file.path) : null;
      if (state) {
        tabEl.setAttribute(TAB_COLOR_ATTR, "");
        tabEl.style.setProperty(TAB_COLOR_PROP, state.color);
      } else {
        tabEl.removeAttribute(TAB_COLOR_ATTR);
        tabEl.style.removeProperty(TAB_COLOR_PROP);
      }
    });
  }
  decorateFileTitle(titleEl) {
    const path = titleEl.getAttribute("data-path");
    const state = path ? this.fileStates.get(path) : null;
    if (this.settings.navIcons) {
      this.injectFileIcon(titleEl);
    }
    if (!state) {
      this.clearFileTitleDecoration(titleEl);
      return;
    }
    titleEl.setAttribute(
      FILE_STATE_ATTR,
      state.matches.length > 0 ? "tagged" : "untagged"
    );
    titleEl.style.setProperty(FILE_COLOR_PROP, state.color);
    this.syncTagBadges(titleEl, state.matches);
  }
  decorateFolderTitle(titleEl) {
    if (this.settings.navIcons) {
      this.injectFolderIcon(titleEl);
    }
    const path = titleEl.getAttribute("data-path");
    if (path && this.unarchivedFolderPaths.has(path)) {
      titleEl.setAttribute(FOLDER_STATE_ATTR, "contains-unarchived");
      titleEl.style.setProperty(FOLDER_COLOR_PROP, UNARCHIVED_COLOR);
      return;
    }
    this.clearFolderTitleDecoration(titleEl);
  }
  injectFileIcon(titleEl) {
    const path = titleEl.getAttribute("data-path") ?? "";
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    const svg = this.getFileIconSvg(ext);
    this.upsertNavIcon(titleEl, ext, svg, ".nav-file-title-content");
  }
  injectFolderIcon(titleEl) {
    const isCollapsed = titleEl.closest(".nav-folder")?.classList.contains("is-collapsed") ?? true;
    const signature = isCollapsed ? "folder-closed" : "folder-open";
    const svg = isCollapsed ? FOLDER_CLOSED_SVG : FOLDER_OPEN_SVG;
    this.upsertNavIcon(titleEl, signature, svg, ".nav-folder-title-content");
  }
  upsertNavIcon(titleEl, signature, svg, anchorSelector) {
    const existing = titleEl.querySelector(`:scope > .${ICON_CLASS}`);
    if (existing?.getAttribute(ICON_ATTR) === signature) return;
    const iconEl = titleEl.ownerDocument.createElement("span");
    iconEl.className = ICON_CLASS;
    iconEl.setAttribute(ICON_ATTR, signature);
    iconEl.setAttribute("aria-hidden", "true");
    iconEl.innerHTML = svg;
    if (existing) {
      existing.replaceWith(iconEl);
    } else {
      const anchor = titleEl.querySelector(anchorSelector);
      if (anchor) {
        titleEl.insertBefore(iconEl, anchor);
      } else {
        titleEl.prepend(iconEl);
      }
    }
  }
  getFileIconSvg(ext) {
    if (TEXT_FILE_EXTENSIONS.has(ext)) return TEXT_FILE_SVG;
    if (CODE_FILE_EXTENSIONS.has(ext)) return CODE_FILE_SVG;
    if (IMAGE_FILE_EXTENSIONS.has(ext)) return IMAGE_FILE_SVG;
    return TEXT_FILE_SVG;
  }
  syncTagBadges(titleEl, matches) {
    const existingContainer = this.findBadgeContainer(titleEl);
    if (!matches.length) {
      existingContainer?.remove();
      return;
    }
    const signature = matches.map((match) => `${match.normalizedTag}:${match.color}`).join("|");
    const container = existingContainer ?? this.createBadgeContainer(titleEl);
    if (container.getAttribute(BADGE_SIGNATURE_ATTR) === signature) return;
    container.setAttribute(BADGE_SIGNATURE_ATTR, signature);
    container.replaceChildren(
      ...matches.map((match) => this.createTagBadge(titleEl.ownerDocument, match))
    );
  }
  findBadgeContainer(titleEl) {
    return titleEl.querySelector(`:scope > .${BADGE_CONTAINER_CLASS}`);
  }
  createBadgeContainer(titleEl) {
    const container = titleEl.ownerDocument.createElement("span");
    container.className = BADGE_CONTAINER_CLASS;
    container.setAttribute("aria-hidden", "true");
    const contentEl = titleEl.querySelector(".nav-file-title-content");
    if (contentEl?.nextSibling) {
      titleEl.insertBefore(container, contentEl.nextSibling);
    } else {
      titleEl.appendChild(container);
    }
    return container;
  }
  createTagBadge(doc, match) {
    const badge = doc.createElement("span");
    badge.className = BADGE_CLASS;
    badge.textContent = match.label;
    badge.title = match.normalizedTag;
    badge.style.setProperty(TAG_COLOR_PROP, match.color);
    return badge;
  }
  clearFileTitleDecoration(titleEl) {
    titleEl.removeAttribute(FILE_STATE_ATTR);
    titleEl.style.removeProperty(FILE_COLOR_PROP);
    this.findBadgeContainer(titleEl)?.remove();
  }
  clearFolderTitleDecoration(titleEl) {
    titleEl.removeAttribute(FOLDER_STATE_ATTR);
    titleEl.style.removeProperty(FOLDER_COLOR_PROP);
  }
  clearFileExplorerDecorations() {
    document.querySelectorAll(`.nav-file-title[${FILE_STATE_ATTR}]`).forEach((titleEl) => this.clearFileTitleDecoration(titleEl));
    document.querySelectorAll(`.${BADGE_CONTAINER_CLASS}`).forEach((badgeContainer) => badgeContainer.remove());
    document.querySelectorAll(`.nav-folder-title[${FOLDER_STATE_ATTR}]`).forEach((titleEl) => this.clearFolderTitleDecoration(titleEl));
    document.querySelectorAll(`.${ICON_CLASS}`).forEach((iconEl) => iconEl.remove());
  }
  // ── Inline tag badge colours ───────────────────────────────────────────────
  /**
   * Injects a <style> element that maps each configured tag's href to its
   * colour via --vsc-inline-tag-color. Re-runs whenever tag configs change.
   */
  syncInlineTagStyles() {
    if (!this.inlineTagStyleEl) {
      this.inlineTagStyleEl = document.createElement("style");
      this.inlineTagStyleEl.id = "vsc-inline-tag-colors";
      document.head.appendChild(this.inlineTagStyleEl);
    }
    const rules = [];
    this.tagConfigs.forEach((config) => {
      const v = cssStringValue(config.normalizedTag);
      rules.push(
        `a.tag[href="${v}"] { ${INLINE_TAG_COLOR_PROP}: ${config.color}; }`,
        `a.tag[href^="${v}/"] { ${INLINE_TAG_COLOR_PROP}: ${config.color}; }`
      );
    });
    this.inlineTagStyleEl.textContent = rules.join("\n");
  }
  installInlineTagObserver() {
    if (this.inlineTagObserver) return;
    this.inlineTagObserver = new MutationObserver(() => {
      this.scheduleInlineTagSync();
    });
    this.inlineTagObserver.observe(this.app.workspace.containerEl, {
      attributes: true,
      attributeFilter: ["class", "style"],
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  registerInlineTagInteractionEvents() {
    this.registerDomEvent(document, "selectionchange", () => {
      this.scheduleInlineTagSync();
    });
    this.registerDomEvent(this.app.workspace.containerEl, "input", () => {
      this.scheduleInlineTagSync();
    });
    this.registerDomEvent(this.app.workspace.containerEl, "keyup", () => {
      this.scheduleInlineTagSync();
    });
    this.registerDomEvent(this.app.workspace.containerEl, "pointerup", () => {
      this.scheduleInlineTagSync();
    });
  }
  disconnectInlineTagObserver() {
    this.inlineTagObserver?.disconnect();
    this.inlineTagObserver = null;
  }
  scheduleInlineTagSync() {
    if (this.inlineTagSyncFrame !== null) return;
    this.inlineTagSyncFrame = window.requestAnimationFrame(() => {
      this.inlineTagSyncFrame = null;
      this.syncInlineTagElements();
    });
  }
  cancelScheduledInlineTagSync() {
    if (this.inlineTagSyncFrame === null) return;
    window.cancelAnimationFrame(this.inlineTagSyncFrame);
    this.inlineTagSyncFrame = null;
  }
  syncInlineTagElements() {
    const visited = /* @__PURE__ */ new Set();
    document.querySelectorAll(
      ".markdown-source-view.is-live-preview span.cm-hashtag"
    ).forEach((tagEl) => {
      if (visited.has(tagEl)) return;
      const segments = this.collectInlineTagSegments(tagEl);
      segments.forEach((segment) => visited.add(segment));
      const tagText = segments.map((segment) => segment.textContent ?? "").join("");
      const config = this.findBestTagConfig(normalizeTagName(tagText));
      this.applyInlineTagColor(segments, config?.color ?? null);
    });
  }
  collectInlineTagSegments(tagEl) {
    let firstSegment = tagEl;
    let previous = firstSegment.previousSibling;
    while (this.isInlineTagSegment(previous)) {
      firstSegment = previous;
      previous = firstSegment.previousSibling;
    }
    const segments = [];
    let current = firstSegment;
    while (this.isInlineTagSegment(current)) {
      segments.push(current);
      current = current.nextSibling;
    }
    return segments;
  }
  isInlineTagSegment(node) {
    return node instanceof HTMLElement && node.classList.contains("cm-hashtag");
  }
  applyInlineTagColor(segments, color) {
    segments.forEach((segment) => {
      if (color) {
        if (segment.style.getPropertyValue(INLINE_TAG_COLOR_PROP) !== color) {
          segment.style.setProperty(INLINE_TAG_COLOR_PROP, color);
        }
        return;
      }
      segment.style.removeProperty(INLINE_TAG_COLOR_PROP);
    });
  }
  clearInlineTagDecorations() {
    document.querySelectorAll("span.cm-hashtag").forEach((tagEl) => tagEl.style.removeProperty(INLINE_TAG_COLOR_PROP));
  }
  // ── Utilities ──────────────────────────────────────────────────────────────
  /**
   * Single pass over all leaves: finds an existing leaf for `file` AND checks
   * whether previewLeaf is still alive — avoids two separate iterations.
   */
  gatherLeafInfo(file) {
    let existing = null;
    let previewAlive = false;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof import_obsidian.FileView && leaf.view.file === file) {
        existing = leaf;
      }
      if (leaf === this.previewLeaf) previewAlive = true;
    });
    return { existing, previewAlive };
  }
  cleanupPreviewLeaf() {
    if (!this.previewLeaf) return;
    let alive = false;
    this.app.workspace.iterateAllLeaves((l) => {
      if (l === this.previewLeaf) alive = true;
    });
    if (!alive) this.previewLeaf = null;
  }
  fileFromEvent(e) {
    const titleEl = e.target.closest(".nav-file-title");
    if (!titleEl) return null;
    const path = titleEl.getAttribute("data-path");
    if (!path) return null;
    const file = this.app.vault.getAbstractFileByPath(path);
    return file instanceof import_obsidian.TFile ? file : null;
  }
  tabHeaderEl(leaf) {
    return leaf.tabHeaderEl ?? null;
  }
};
var ActLikeVSCodeSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("\u50CF VS Code \u4E00\u6837\u6253\u5F00\u6807\u7B7E\u9875").setDesc("\u5355\u51FB\u9884\u89C8\uFF0C\u53CC\u51FB\u56FA\u5B9A\u3002").setHeading();
    new import_obsidian.Setting(containerEl).setName("\u5BFC\u822A\u680F\u56FE\u6807").setDesc("\u514B\u5236\u7684\u4E3A\u6587\u4EF6\u5BFC\u822A\u680F\u6DFB\u52A0\u56FE\u6807\u3002").addToggle((toggle) => {
      toggle.setValue(this.plugin.isNavIconsEnabled());
      toggle.onChange(async (value) => {
        await this.plugin.setNavIcons(value);
      });
    });
    new import_obsidian.Setting(containerEl).setName("\u6807\u7B7E").setDesc(
      "\u914D\u7F6E\u6807\u7B7E\uFF0C\u5728\u6587\u4EF6\u4E2D\u4F7F\u7528\u539F\u751F # \u6DFB\u52A0\u6807\u7B7E\u3002\u6807\u8BB0\u4E3A\u5F52\u6863\u7684\u6587\u4EF6\u4F1A\u6709\u5355\u72EC\u7684\u6837\u5F0F\uFF0C\u5176\u4ED6\u6807\u7B7E\u5C55\u793A\u5728\u6587\u4EF6\u6807\u9898\u53F3\u4FA7\u3002"
    ).setHeading();
    const listEl = containerEl.createDiv({ cls: "vsc-tag-list" });
    this.plugin.getTagSettings().forEach((tag, index) => {
      this.renderTagRow(listEl, tag, index);
    });
    this.renderAddTagRow(listEl);
  }
  renderTagRow(listEl, tag, index) {
    const isArchive = this.plugin.isArchiveTagIndex(index);
    const rowEl = listEl.createDiv({
      cls: `vsc-tag-list-item${isArchive ? " is-archive" : ""}`
    });
    const titleEl = rowEl.createDiv({ cls: "vsc-tag-row-title" });
    if (isArchive) {
      titleEl.createEl("input", {
        cls: "vsc-tag-title-input is-readonly",
        attr: {
          type: "text",
          value: ARCHIVE_LABEL,
          readonly: "",
          tabindex: "-1",
          "aria-label": "\u56FA\u5B9A\u6807\u7B7E\uFF08\u4E0D\u53EF\u7F16\u8F91\uFF09"
        }
      });
    } else {
      const titleInput = titleEl.createEl("input", {
        cls: "vsc-tag-title-input",
        attr: {
          type: "text",
          maxlength: String(MAX_TAG_LABEL_CHARS),
          value: tag.name,
          "aria-label": "\u6807\u7B7E\u540D"
        }
      });
      titleInput.addEventListener("input", () => {
        const truncated = Array.from(titleInput.value).slice(0, MAX_TAG_LABEL_CHARS).join("");
        if (titleInput.value !== truncated) titleInput.value = truncated;
        void this.plugin.updateTagName(index, truncated);
      });
    }
    const colorEl = rowEl.createDiv({ cls: "vsc-tag-row-colors" });
    this.renderColorChoices(colorEl, tag.colorId, (colorId) => {
      void this.plugin.updateTagColor(index, colorId).then(() => this.display());
    });
    const actionsEl = rowEl.createDiv({ cls: "vsc-tag-row-actions" });
    if (!isArchive) {
      const deleteButton = actionsEl.createEl("button", {
        text: "\xD7",
        cls: "vsc-tag-delete-button",
        attr: { type: "button", "aria-label": "\u5220\u9664\u6807\u7B7E" }
      });
      deleteButton.addEventListener("click", async () => {
        await this.plugin.removeTagSetting(index);
        this.display();
      });
    }
  }
  renderAddTagRow(listEl) {
    const footerEl = listEl.createDiv({ cls: "vsc-tag-list-footer" });
    const addButton = footerEl.createEl("button", {
      text: "\u65B0\u589E\u6807\u7B7E",
      cls: "vsc-tag-add-button mod-cta",
      attr: { type: "button" }
    });
    addButton.disabled = this.plugin.getTagSettings().length >= MAX_TAG_CONFIGS;
    addButton.addEventListener("click", async () => {
      if (await this.plugin.addTagSetting()) {
        this.display();
        const inputs = this.containerEl.querySelectorAll(
          ".vsc-tag-title-input:not(.is-readonly)"
        );
        const lastInput = inputs[inputs.length - 1];
        if (lastInput) {
          lastInput.focus();
          lastInput.addEventListener("blur", async () => {
            if (!lastInput.value.trim()) {
              const tagCount = this.plugin.getTagSettings().length;
              await this.plugin.removeTagSetting(tagCount - 1);
              this.display();
            }
          }, { once: true });
        }
      }
    });
  }
  renderColorChoices(controlEl, selectedColorId, onChoose) {
    const swatchGroup = controlEl.createDiv({
      cls: "vsc-tag-color-choices",
      attr: { role: "radiogroup", "aria-label": "\u6807\u7B7E\u989C\u8272" }
    });
    this.plugin.getColorOptions().forEach((option) => {
      const isSelected = option.id === selectedColorId;
      const button = swatchGroup.createEl("button", {
        cls: "vsc-tag-color-choice",
        attr: {
          type: "button",
          role: "radio",
          "aria-label": option.label,
          "aria-checked": String(isSelected),
          "data-selected": String(isSelected)
        }
      });
      button.style.setProperty("--vsc-setting-color", option.swatch);
      button.addEventListener("click", () => onChoose(option.id));
    });
  }
};
