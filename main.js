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
  default: () => OpenLikeVSC
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var PREVIEW_ATTR = "data-vsc-preview";
var TAB_HANDLER_ATTR = "data-vsc-handler";
var FILE_STATE_ATTR = "data-vsc-file-state";
var FOLDER_STATE_ATTR = "data-vsc-folder-state";
var BADGE_CONTAINER_CLASS = "vsc-nav-tag-badges";
var BADGE_CLASS = "vsc-nav-tag-badge";
var BADGE_SIGNATURE_ATTR = "data-vsc-badge-signature";
var FILE_COLOR_PROP = "--vsc-nav-file-color";
var FOLDER_COLOR_PROP = "--vsc-nav-folder-color";
var TAG_COLOR_PROP = "--vsc-nav-tag-color";
var ARCHIVE_LABEL = "\u5F52\u6863";
var ARCHIVE_TAG = "#\u5F52\u6863";
var UNARCHIVED_COLOR = "var(--color-green, #08b94e)";
var MAX_TAG_CONFIGS = 8;
var MAX_TAG_LABEL_CHARS = 5;
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
  ]
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
function isTagColorId(value) {
  return TAG_COLOR_OPTIONS.some((option) => option.id === value);
}
function defaultSettings() {
  return {
    tags: DEFAULT_SETTINGS.tags.map((tag) => ({ ...tag }))
  };
}
var OpenLikeVSC = class extends import_obsidian.Plugin {
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
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new OpenLikeVSCSettingTab(this.app, this));
    this.registerDomEvent(document, "click", this.onDocumentClick, true);
    this.registerDomEvent(document, "dblclick", this.onDocumentDblClick, true);
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.syncTabHandlers();
        this.cleanupPreviewLeaf();
        this.scheduleFileExplorerSync();
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (!leaf || leaf === this.previewLeaf) return;
        if (leaf.view.getViewType() === "empty") {
          this.setAsPreview(leaf);
        }
      })
    );
    this.app.workspace.onLayoutReady(() => this.initializeFileExplorerStyling());
    this.syncTabHandlers();
  }
  onunload() {
    this.disconnectFileExplorerObserver();
    this.cancelScheduledFileExplorerSync();
    this.clearFileExplorerDecorations();
    this.fileStates.clear();
    this.unarchivedFolderPaths.clear();
    document.querySelectorAll(`[${PREVIEW_ATTR}]`).forEach((el) => {
      el.removeAttribute(PREVIEW_ATTR);
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
    const nextName = this.nextTagName();
    this.settings = {
      tags: [...this.settings.tags, { name: nextName, colorId: "blue" }]
    };
    await this.persistSettings();
    return true;
  }
  async updateTagName(index, name) {
    if (this.isArchiveTagIndex(index)) return;
    const tags = this.settings.tags.map(
      (tag, tagIndex) => tagIndex === index ? { ...tag, name } : tag
    );
    this.settings = this.normalizeSettings({ tags });
    await this.persistSettings();
  }
  async updateTagColor(index, colorId) {
    if (!isTagColorId(colorId)) return;
    const tags = this.settings.tags.map(
      (tag, tagIndex) => tagIndex === index ? { ...tag, colorId } : tag
    );
    this.settings = this.normalizeSettings({ tags });
    await this.persistSettings();
  }
  async removeTagSetting(index) {
    if (this.isArchiveTagIndex(index)) return;
    this.settings = this.normalizeSettings({
      tags: this.settings.tags.filter((_tag, tagIndex) => tagIndex !== index)
    });
    await this.persistSettings();
  }
  async loadSettings() {
    this.settings = this.normalizeSettings(await this.loadData());
    this.tagConfigs = this.buildTagConfigs(this.settings);
  }
  async persistSettings() {
    await this.saveData(this.settings);
    this.tagConfigs = this.buildTagConfigs(this.settings);
    this.rebuildFileStatusIndex();
    this.scheduleFileExplorerSync();
  }
  normalizeSettings(data) {
    const rawTags = this.isSettingsLike(data) && Array.isArray(data.tags) ? data.tags : [];
    const archiveTag = this.normalizeArchiveTag(rawTags[0]);
    const customTags = rawTags.slice(1, MAX_TAG_CONFIGS).filter((tag) => this.isStoredTagConfig(tag)).map((tag) => ({
      name: normalizeTagLabel(tag.name),
      colorId: tag.colorId
    }));
    return {
      tags: [archiveTag, ...customTags].slice(0, MAX_TAG_CONFIGS)
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
      attributeFilter: ["data-path"]
    });
  }
  disconnectFileExplorerObserver() {
    this.fileExplorerObserver?.disconnect();
    this.fileExplorerObserver = null;
  }
  shouldSyncForMutation(mutation) {
    if (mutation.type === "attributes") return true;
    const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
    if (!changedNodes.length) return false;
    return !changedNodes.every((node) => this.isPluginBadgeNode(node));
  }
  isPluginBadgeNode(node) {
    if (!(node instanceof HTMLElement)) return false;
    return node.classList.contains(BADGE_CONTAINER_CLASS) || node.classList.contains(BADGE_CLASS) || node.closest(`.${BADGE_CONTAINER_CLASS}`) !== null;
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
  }
  decorateFileTitle(titleEl) {
    const path = titleEl.getAttribute("data-path");
    const state = path ? this.fileStates.get(path) : null;
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
    const path = titleEl.getAttribute("data-path");
    if (path && this.unarchivedFolderPaths.has(path)) {
      titleEl.setAttribute(FOLDER_STATE_ATTR, "contains-unarchived");
      titleEl.style.setProperty(FOLDER_COLOR_PROP, UNARCHIVED_COLOR);
      return;
    }
    this.clearFolderTitleDecoration(titleEl);
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
var OpenLikeVSCSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("\u6807\u7B7E").setDesc(
      `\u914D\u7F6E\u6587\u4EF6\u5BFC\u822A\u680F\u4E2D\u8BC6\u522B\u7684\u6807\u7B7E\u3002\u6700\u591A ${MAX_TAG_CONFIGS} \u4E2A\uFF0C\u6807\u7B7E\u540D\u6700\u591A ${MAX_TAG_LABEL_CHARS} \u5B57\u3002`
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
      titleEl.createSpan({ text: ARCHIVE_LABEL, cls: "vsc-tag-fixed-title" });
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
        void this.plugin.updateTagName(index, titleInput.value);
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
      if (await this.plugin.addTagSetting()) this.display();
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
