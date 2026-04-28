import {
  App,
  FileView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
  WorkspaceLeaf,
  type CachedMetadata,
  type TAbstractFile,
  type TagCache,
} from "obsidian";

// Attribute placed on the tab header element to mark it as a preview tab.
const PREVIEW_ATTR = "data-vsc-preview";
// Attribute placed on the tab header element once our dblclick listener is attached.
const TAB_HANDLER_ATTR = "data-vsc-handler";
// Attribute placed on a file title when our file-explorer status style is active.
const FILE_STATE_ATTR = "data-vsc-file-state";
// Attribute placed on a folder title when one of its descendants is unarchived.
const FOLDER_STATE_ATTR = "data-vsc-folder-state";

const BADGE_CONTAINER_CLASS = "vsc-nav-tag-badges";
const BADGE_CLASS = "vsc-nav-tag-badge";
const BADGE_SIGNATURE_ATTR = "data-vsc-badge-signature";

const FILE_COLOR_PROP = "--vsc-nav-file-color";
const FOLDER_COLOR_PROP = "--vsc-nav-folder-color";
const TAG_COLOR_PROP = "--vsc-nav-tag-color";

const ARCHIVE_LABEL = "归档";
const ARCHIVE_TAG = "#归档";
const UNTAGGED_FILE_COLOR = "var(--color-orange, #d9822b)";
const UNARCHIVED_FOLDER_COLOR = "var(--color-blue, #2f80ed)";
const MAX_TAG_CONFIGS = 8;
const MAX_TAG_LABEL_CHARS = 5;

/**
 * Thin wrapper so we can access the internal `tabHeaderEl` without casting everywhere.
 */
interface LeafWithTabHeader extends WorkspaceLeaf {
  tabHeaderEl?: HTMLElement;
}

type TagColorId =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "purple";

interface TagColorOption {
  readonly id: TagColorId;
  readonly label: string;
  readonly value: string;
  readonly swatch: string;
}

interface StoredTagConfig {
  readonly name: string;
  readonly colorId: TagColorId;
}

interface PluginSettings {
  readonly tags: readonly StoredTagConfig[];
}

interface TagConfig {
  readonly label: string;
  readonly tag: string;
  readonly color: string;
  readonly isArchive: boolean;
}

interface NormalizedTagConfig extends TagConfig {
  readonly normalizedTag: string;
}

interface FileTagMatch {
  readonly label: string;
  readonly normalizedTag: string;
  readonly color: string;
  readonly isArchive: boolean;
}

interface FileTagMatchResult {
  readonly visibleMatches: readonly FileTagMatch[];
  readonly archiveMatch: FileTagMatch | null;
  readonly lastNonArchiveMatch: FileTagMatch | null;
  readonly hasArchiveTag: boolean;
}

interface FileNavState {
  readonly matches: readonly FileTagMatch[];
  readonly color: string;
  readonly hasArchiveTag: boolean;
}

const TAG_COLOR_OPTIONS: readonly TagColorOption[] = [
  { id: "gray", label: "灰色", value: "var(--text-muted)", swatch: "#8a8a8a" },
  { id: "red", label: "红色", value: "var(--color-red, #e93147)", swatch: "#e93147" },
  { id: "orange", label: "橙色", value: "var(--color-orange, #d9822b)", swatch: "#d9822b" },
  { id: "yellow", label: "黄色", value: "var(--color-yellow, #e0ac00)", swatch: "#e0ac00" },
  { id: "green", label: "绿色", value: "var(--color-green, #08b94e)", swatch: "#08b94e" },
  { id: "cyan", label: "青色", value: "var(--color-cyan, #00a3bf)", swatch: "#00a3bf" },
  { id: "blue", label: "蓝色", value: "var(--color-blue, #2f80ed)", swatch: "#2f80ed" },
  { id: "purple", label: "紫色", value: "var(--color-purple, #8b5cf6)", swatch: "#8b5cf6" },
];

const DEFAULT_SETTINGS: PluginSettings = {
  tags: [
    {
      name: ARCHIVE_LABEL,
      colorId: "gray",
    },
  ],
};

const DEFAULT_TAG_CONFIGS: readonly TagConfig[] = [
  {
    label: ARCHIVE_LABEL,
    tag: ARCHIVE_TAG,
    color: colorValue("gray"),
    isArchive: true,
  },
];

function normalizeTagName(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function normalizeTagLabel(label: string): string {
  return limitTagLabel(label.trim().replace(/^#+/u, ""));
}

function limitTagLabel(label: string): string {
  return Array.from(label).slice(0, MAX_TAG_LABEL_CHARS).join("");
}

function colorValue(colorId: TagColorId): string {
  return (
    TAG_COLOR_OPTIONS.find((option) => option.id === colorId)?.value ??
    TAG_COLOR_OPTIONS[0].value
  );
}

function isTagColorId(value: unknown): value is TagColorId {
  return TAG_COLOR_OPTIONS.some((option) => option.id === value);
}

function defaultSettings(): PluginSettings {
  return {
    tags: DEFAULT_SETTINGS.tags.map((tag) => ({ ...tag })),
  };
}

export default class OpenLikeVSC extends Plugin {
  /** The current "preview" leaf — can be replaced by the next single-click. */
  private previewLeaf: WorkspaceLeaf | null = null;
  private settings: PluginSettings = defaultSettings();
  private tagConfigs: readonly NormalizedTagConfig[] =
    this.buildTagConfigs(this.settings);
  private readonly fileStates = new Map<string, FileNavState>();
  private readonly unarchivedFolderPaths = new Set<string>();
  private fileExplorerObserver: MutationObserver | null = null;
  private fileExplorerSyncFrame: number | null = null;
  private fileExplorerInitialized = false;
  private initialMetadataResolved = false;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  override async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new OpenLikeVSCSettingTab(this.app, this));

    // Capture phase fires before Obsidian's own bubble-phase handlers.
    // We register both click and dblclick to avoid any timer-based delays.
    this.registerDomEvent(document, "click", this.onDocumentClick, true);
    this.registerDomEvent(document, "dblclick", this.onDocumentDblClick, true);

    // Keep tab handlers and file-explorer decorations in sync with Obsidian redraws.
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.syncTabHandlers();
        this.cleanupPreviewLeaf();
        this.scheduleFileExplorerSync();
      })
    );

    // When the active leaf switches to a blank "New tab", treat it as a preview
    // slot so the next single-click opens the file there instead of creating yet
    // another tab (mirrors VS Code's behaviour with the + button).
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

  override onunload(): void {
    this.disconnectFileExplorerObserver();
    this.cancelScheduledFileExplorerSync();
    this.clearFileExplorerDecorations();
    this.fileStates.clear();
    this.unarchivedFolderPaths.clear();

    // Strip all preview markers so Obsidian's UI is left clean.
    document.querySelectorAll(`[${PREVIEW_ATTR}]`).forEach((el) => {
      el.removeAttribute(PREVIEW_ATTR);
    });
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  getTagSettings(): readonly StoredTagConfig[] {
    return this.settings.tags;
  }

  getColorOptions(): readonly TagColorOption[] {
    return TAG_COLOR_OPTIONS;
  }

  isArchiveTagIndex(index: number): boolean {
    return index === 0;
  }

  async addTagSetting(): Promise<boolean> {
    if (this.settings.tags.length >= MAX_TAG_CONFIGS) {
      new Notice(`最多只能配置 ${MAX_TAG_CONFIGS} 个标签。`);
      return false;
    }

    const nextName = this.nextTagName();
    this.settings = {
      tags: [...this.settings.tags, { name: nextName, colorId: "blue" }],
    };
    await this.persistSettings();
    return true;
  }

  async updateTagName(index: number, name: string): Promise<void> {
    if (this.isArchiveTagIndex(index)) return;

    const tags = this.settings.tags.map((tag, tagIndex) =>
      tagIndex === index ? { ...tag, name } : tag
    );
    this.settings = this.normalizeSettings({ tags });
    await this.persistSettings();
  }

  async updateTagColor(index: number, colorId: string): Promise<void> {
    if (!isTagColorId(colorId)) return;

    const tags = this.settings.tags.map((tag, tagIndex) =>
      tagIndex === index ? { ...tag, colorId } : tag
    );
    this.settings = this.normalizeSettings({ tags });
    await this.persistSettings();
  }

  async removeTagSetting(index: number): Promise<void> {
    if (this.isArchiveTagIndex(index)) return;

    this.settings = this.normalizeSettings({
      tags: this.settings.tags.filter((_tag, tagIndex) => tagIndex !== index),
    });
    await this.persistSettings();
  }

  private async loadSettings(): Promise<void> {
    this.settings = this.normalizeSettings(await this.loadData());
    this.tagConfigs = this.buildTagConfigs(this.settings);
  }

  private async persistSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.tagConfigs = this.buildTagConfigs(this.settings);
    this.rebuildFileStatusIndex();
    this.scheduleFileExplorerSync();
  }

  private normalizeSettings(data: unknown): PluginSettings {
    const rawTags =
      this.isSettingsLike(data) && Array.isArray(data.tags) ? data.tags : [];

    const archiveTag = this.normalizeArchiveTag(rawTags[0]);
    const customTags = rawTags
      .slice(1, MAX_TAG_CONFIGS)
      .filter((tag): tag is StoredTagConfig => this.isStoredTagConfig(tag))
      .map((tag) => ({
        name: normalizeTagLabel(tag.name),
        colorId: tag.colorId,
      }));

    return {
      tags: [archiveTag, ...customTags].slice(0, MAX_TAG_CONFIGS),
    };
  }

  private isSettingsLike(data: unknown): data is { tags: unknown[] } {
    return typeof data === "object" && data !== null && "tags" in data;
  }

  private isStoredTagConfig(data: unknown): data is StoredTagConfig {
    if (typeof data !== "object" || data === null) return false;

    const record = data as Record<string, unknown>;
    return typeof record.name === "string" && isTagColorId(record.colorId);
  }

  private normalizeArchiveTag(data: unknown): StoredTagConfig {
    if (this.isStoredTagConfig(data)) {
      return {
        name: ARCHIVE_LABEL,
        colorId: data.colorId,
      };
    }

    return {
      name: ARCHIVE_LABEL,
      colorId: "gray",
    };
  }

  private buildTagConfigs(
    settings: PluginSettings
  ): readonly NormalizedTagConfig[] {
    const usedTags = new Set<string>();

    return settings.tags.flatMap((tag, index) => {
      const label = this.isArchiveTagIndex(index)
        ? ARCHIVE_LABEL
        : normalizeTagLabel(tag.name);
      const normalizedTag = normalizeTagName(label);

      if (!normalizedTag || usedTags.has(normalizedTag)) return [];
      usedTags.add(normalizedTag);

      return [
        {
          label,
          tag: normalizedTag,
          normalizedTag,
          color: colorValue(tag.colorId),
          isArchive: this.isArchiveTagIndex(index),
        },
      ];
    });
  }

  private archiveTagConfig(): NormalizedTagConfig {
    const archiveConfig = this.tagConfigs.find((config) => config.isArchive);
    if (archiveConfig) return archiveConfig;

    return {
      ...DEFAULT_TAG_CONFIGS[0],
      normalizedTag: normalizeTagName(DEFAULT_TAG_CONFIGS[0].tag),
    };
  }

  private nextTagName(): string {
    const names = new Set(this.settings.tags.map((tag) => tag.name));
    let suffix = this.settings.tags.length;

    while (names.has(`新标签${suffix}`)) {
      suffix += 1;
    }

    return `新标签${suffix}`;
  }

  // ── File-explorer event interception ──────────────────────────────────────

  /**
   * Single click: open immediately, no timer delay.
   * When part of a double-click the second click is effectively a no-op
   * (file is already open → just focuses), and the dblclick handler pins it.
   */
  private readonly onDocumentClick = (e: MouseEvent): void => {
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
  private readonly onDocumentDblClick = (e: MouseEvent): void => {
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
  private async handleSingleClick(file: TFile): Promise<void> {
    const { existing, previewAlive } = this.gatherLeafInfo(file);

    if (existing) {
      this.app.workspace.setActiveLeaf(existing, { focus: true });
      return;
    }

    if (this.previewLeaf && previewAlive) {
      const leaf = this.previewLeaf;
      await leaf.openFile(file);
      // Re-apply the style in case it was lost during the file switch.
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
  private async handleDoubleClick(file: TFile): Promise<void> {
    const { existing, previewAlive } = this.gatherLeafInfo(file);

    if (existing) {
      if (this.previewLeaf === existing) this.clearPreview();
      this.app.workspace.setActiveLeaf(existing, { focus: true });
      return;
    }

    // Rare edge case: file not yet open (e.g., click promise still in flight).
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

  private syncTabHandlers(): void {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const tabEl = this.tabHeaderEl(leaf);
      if (!tabEl || tabEl.getAttribute(TAB_HANDLER_ATTR)) return;

      tabEl.setAttribute(TAB_HANDLER_ATTR, "true");
      // Use capture phase so we intercept before Obsidian's own dblclick
      // handlers (which can trigger macOS window zoom via Electron).
      tabEl.addEventListener("dblclick", (e: MouseEvent) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        if (this.previewLeaf === leaf) this.clearPreview();
      }, true /* capture */);
    });
  }

  // ── Preview-state helpers ──────────────────────────────────────────────────

  private setAsPreview(leaf: WorkspaceLeaf): void {
    if (this.previewLeaf && this.previewLeaf !== leaf) {
      this.applyPreviewStyle(this.previewLeaf, false);
    }
    this.previewLeaf = leaf;
    this.applyPreviewStyle(leaf, true);
  }

  private clearPreview(): void {
    if (!this.previewLeaf) return;
    this.applyPreviewStyle(this.previewLeaf, false);
    this.previewLeaf = null;
  }

  private applyPreviewStyle(leaf: WorkspaceLeaf, preview: boolean): void {
    const tabEl = this.tabHeaderEl(leaf);
    if (!tabEl) return;
    if (preview) {
      tabEl.setAttribute(PREVIEW_ATTR, "");
    } else {
      tabEl.removeAttribute(PREVIEW_ATTR);
    }
  }

  // ── File-explorer tag state ────────────────────────────────────────────────

  private initializeFileExplorerStyling(): void {
    if (this.fileExplorerInitialized) return;
    this.fileExplorerInitialized = true;

    this.registerFileStatusEvents();
    this.rebuildFileStatusIndex();
    this.installFileExplorerObserver();
    this.syncFileExplorerDecorations();
  }

  private registerFileStatusEvents(): void {
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
      this.app.vault.on("rename", (file, oldPath) =>
        this.handleVaultRename(file, oldPath)
      )
    );
  }

  private rebuildFileStatusIndex(): void {
    this.fileStates.clear();
    this.app.vault.getMarkdownFiles().forEach((file) => {
      this.updateFileState(file);
    });
    this.recalculateFolderStates();
  }

  private updateFileState(
    file: TFile,
    cache: CachedMetadata | null = this.app.metadataCache.getFileCache(file)
  ): void {
    if (!this.isMarkdownFile(file)) {
      this.fileStates.delete(file.path);
      return;
    }

    const matchResult = this.matchConfiguredTags(cache);
    this.fileStates.set(file.path, {
      matches: matchResult.visibleMatches,
      color:
        matchResult.archiveMatch?.color ??
        matchResult.lastNonArchiveMatch?.color ??
        UNTAGGED_FILE_COLOR,
      hasArchiveTag: matchResult.hasArchiveTag,
    });
  }

  private matchConfiguredTags(cache: CachedMetadata | null): FileTagMatchResult {
    const visibleMatches: FileTagMatch[] = [];
    const seenConfigTags = new Set<string>();
    let archiveMatch: FileTagMatch | null = null;
    let lastNonArchiveMatch: FileTagMatch | null = null;
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

      const match: FileTagMatch = {
        label: config.label,
        normalizedTag: config.normalizedTag,
        color: config.color,
        isArchive: config.isArchive,
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
      hasArchiveTag,
    };
  }

  private orderedTagsFromCache(cache: CachedMetadata | null): string[] {
    if (!cache) return [];

    const tags: string[] = [];
    tags.push(...this.frontmatterTags(cache));
    tags.push(
      ...(cache.tags ?? [])
        .toSorted((a, b) => this.compareTagPosition(a, b))
        .map((tag) => tag.tag)
    );
    return tags;
  }

  private frontmatterTags(cache: CachedMetadata): string[] {
    const frontmatter = cache.frontmatter as Record<string, unknown> | undefined;
    return this.tagsFromUnknown(frontmatter?.tags);
  }

  private tagsFromUnknown(value: unknown): string[] {
    if (typeof value === "string") {
      return value
        .split(/[\s,]+/u)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) => this.tagsFromUnknown(item));
    }

    return [];
  }

  private compareTagPosition(a: TagCache, b: TagCache): number {
    return a.position.start.offset - b.position.start.offset;
  }

  private findBestTagConfig(normalizedTag: string): NormalizedTagConfig | null {
    let bestConfig: NormalizedTagConfig | null = null;

    this.tagConfigs.forEach((config) => {
      if (!this.tagMatchesConfig(normalizedTag, config.normalizedTag)) return;
      if (
        !bestConfig ||
        config.normalizedTag.length > bestConfig.normalizedTag.length
      ) {
        bestConfig = config;
      }
    });

    return bestConfig;
  }

  private tagMatchesConfig(actualTag: string, configuredTag: string): boolean {
    return (
      actualTag === configuredTag || actualTag.startsWith(`${configuredTag}/`)
    );
  }

  private recalculateFolderStates(): void {
    this.unarchivedFolderPaths.clear();

    this.fileStates.forEach((state, filePath) => {
      if (state.hasArchiveTag) return;
      this.ancestorFolderPaths(filePath).forEach((folderPath) => {
        this.unarchivedFolderPaths.add(folderPath);
      });
    });
  }

  private ancestorFolderPaths(filePath: string): string[] {
    const folderParts = filePath.split("/").slice(0, -1);
    const paths: string[] = [];

    for (let length = folderParts.length; length > 0; length -= 1) {
      paths.push(folderParts.slice(0, length).join("/"));
    }

    return paths;
  }

  private handleVaultCreate(file: TAbstractFile): void {
    if (file instanceof TFile) {
      this.updateFileState(file);
      this.recalculateFolderStates();
    }
    this.scheduleFileExplorerSync();
  }

  private handleVaultDelete(file: TAbstractFile): void {
    if (file instanceof TFile) {
      this.fileStates.delete(file.path);
      this.recalculateFolderStates();
    } else if (file instanceof TFolder) {
      this.rebuildFileStatusIndex();
    }
    this.scheduleFileExplorerSync();
  }

  private handleVaultRename(file: TAbstractFile, oldPath: string): void {
    if (file instanceof TFile) {
      this.fileStates.delete(oldPath);
      this.updateFileState(file);
      this.recalculateFolderStates();
    } else if (file instanceof TFolder) {
      this.rebuildFileStatusIndex();
    }
    this.scheduleFileExplorerSync();
  }

  private isMarkdownFile(file: TFile): boolean {
    return file.extension.toLowerCase() === "md";
  }

  // ── File-explorer DOM decoration ───────────────────────────────────────────

  private installFileExplorerObserver(): void {
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
      attributeFilter: ["data-path"],
    });
  }

  private disconnectFileExplorerObserver(): void {
    this.fileExplorerObserver?.disconnect();
    this.fileExplorerObserver = null;
  }

  private shouldSyncForMutation(mutation: MutationRecord): boolean {
    if (mutation.type === "attributes") return true;

    const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
    if (!changedNodes.length) return false;

    return !changedNodes.every((node) => this.isPluginBadgeNode(node));
  }

  private isPluginBadgeNode(node: Node): boolean {
    if (!(node instanceof HTMLElement)) return false;
    return (
      node.classList.contains(BADGE_CONTAINER_CLASS) ||
      node.classList.contains(BADGE_CLASS) ||
      node.closest(`.${BADGE_CONTAINER_CLASS}`) !== null
    );
  }

  private scheduleFileExplorerSync(): void {
    if (!this.fileExplorerInitialized || this.fileExplorerSyncFrame !== null) {
      return;
    }

    this.fileExplorerSyncFrame = window.requestAnimationFrame(() => {
      this.fileExplorerSyncFrame = null;
      this.syncFileExplorerDecorations();
    });
  }

  private cancelScheduledFileExplorerSync(): void {
    if (this.fileExplorerSyncFrame === null) return;
    window.cancelAnimationFrame(this.fileExplorerSyncFrame);
    this.fileExplorerSyncFrame = null;
  }

  private syncFileExplorerDecorations(): void {
    document.querySelectorAll<HTMLElement>(".nav-file-title[data-path]").forEach(
      (titleEl) => this.decorateFileTitle(titleEl)
    );

    document
      .querySelectorAll<HTMLElement>(".nav-folder-title[data-path]")
      .forEach((titleEl) => this.decorateFolderTitle(titleEl));
  }

  private decorateFileTitle(titleEl: HTMLElement): void {
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

  private decorateFolderTitle(titleEl: HTMLElement): void {
    const path = titleEl.getAttribute("data-path");

    if (path && this.unarchivedFolderPaths.has(path)) {
      titleEl.setAttribute(FOLDER_STATE_ATTR, "contains-unarchived");
      titleEl.style.setProperty(FOLDER_COLOR_PROP, UNARCHIVED_FOLDER_COLOR);
      return;
    }

    this.clearFolderTitleDecoration(titleEl);
  }

  private syncTagBadges(
    titleEl: HTMLElement,
    matches: readonly FileTagMatch[]
  ): void {
    const existingContainer = this.findBadgeContainer(titleEl);
    if (!matches.length) {
      existingContainer?.remove();
      return;
    }

    const signature = matches
      .map((match) => `${match.normalizedTag}:${match.color}`)
      .join("|");
    const container = existingContainer ?? this.createBadgeContainer(titleEl);
    if (container.getAttribute(BADGE_SIGNATURE_ATTR) === signature) return;

    container.setAttribute(BADGE_SIGNATURE_ATTR, signature);
    container.replaceChildren(
      ...matches.map((match) => this.createTagBadge(titleEl.ownerDocument, match))
    );
  }

  private findBadgeContainer(titleEl: HTMLElement): HTMLElement | null {
    return titleEl.querySelector<HTMLElement>(`:scope > .${BADGE_CONTAINER_CLASS}`);
  }

  private createBadgeContainer(titleEl: HTMLElement): HTMLElement {
    const container = titleEl.ownerDocument.createElement("span");
    container.className = BADGE_CONTAINER_CLASS;
    container.setAttribute("aria-hidden", "true");

    const contentEl = titleEl.querySelector<HTMLElement>(".nav-file-title-content");
    if (contentEl?.nextSibling) {
      titleEl.insertBefore(container, contentEl.nextSibling);
    } else {
      titleEl.appendChild(container);
    }

    return container;
  }

  private createTagBadge(doc: Document, match: FileTagMatch): HTMLElement {
    const badge = doc.createElement("span");
    badge.className = BADGE_CLASS;
    badge.textContent = match.label;
    badge.title = match.normalizedTag;
    badge.style.setProperty(TAG_COLOR_PROP, match.color);
    return badge;
  }

  private clearFileTitleDecoration(titleEl: HTMLElement): void {
    titleEl.removeAttribute(FILE_STATE_ATTR);
    titleEl.style.removeProperty(FILE_COLOR_PROP);
    this.findBadgeContainer(titleEl)?.remove();
  }

  private clearFolderTitleDecoration(titleEl: HTMLElement): void {
    titleEl.removeAttribute(FOLDER_STATE_ATTR);
    titleEl.style.removeProperty(FOLDER_COLOR_PROP);
  }

  private clearFileExplorerDecorations(): void {
    document
      .querySelectorAll<HTMLElement>(`.nav-file-title[${FILE_STATE_ATTR}]`)
      .forEach((titleEl) => this.clearFileTitleDecoration(titleEl));

    document
      .querySelectorAll<HTMLElement>(`.${BADGE_CONTAINER_CLASS}`)
      .forEach((badgeContainer) => badgeContainer.remove());

    document
      .querySelectorAll<HTMLElement>(`.nav-folder-title[${FOLDER_STATE_ATTR}]`)
      .forEach((titleEl) => this.clearFolderTitleDecoration(titleEl));
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  /**
   * Single pass over all leaves: finds an existing leaf for `file` AND checks
   * whether previewLeaf is still alive — avoids two separate iterations.
   */
  private gatherLeafInfo(
    file: TFile
  ): { existing: WorkspaceLeaf | null; previewAlive: boolean } {
    let existing: WorkspaceLeaf | null = null;
    let previewAlive = false;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof FileView && leaf.view.file === file) {
        existing = leaf;
      }
      if (leaf === this.previewLeaf) previewAlive = true;
    });
    return { existing, previewAlive };
  }

  private cleanupPreviewLeaf(): void {
    if (!this.previewLeaf) return;
    let alive = false;
    this.app.workspace.iterateAllLeaves((l) => {
      if (l === this.previewLeaf) alive = true;
    });
    if (!alive) this.previewLeaf = null;
  }

  private fileFromEvent(e: MouseEvent): TFile | null {
    const titleEl = (e.target as HTMLElement).closest<HTMLElement>(".nav-file-title");
    if (!titleEl) return null;
    const path = titleEl.getAttribute("data-path");
    if (!path) return null;
    const file = this.app.vault.getAbstractFileByPath(path);
    return file instanceof TFile ? file : null;
  }

  private tabHeaderEl(leaf: WorkspaceLeaf): HTMLElement | null {
    return (leaf as LeafWithTabHeader).tabHeaderEl ?? null;
  }
}

class OpenLikeVSCSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: OpenLikeVSC) {
    super(app, plugin);
  }

  override display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("标签")
      .setDesc(
        `配置文件导航栏中识别的标签。最多 ${MAX_TAG_CONFIGS} 个，标签名最多 ${MAX_TAG_LABEL_CHARS} 字。`
      )
      .setHeading();

    const listEl = containerEl.createDiv({ cls: "vsc-tag-list" });
    this.plugin.getTagSettings().forEach((tag, index) => {
      this.renderTagRow(listEl, tag, index);
    });

    this.renderAddTagRow(listEl);
  }

  private renderTagRow(
    listEl: HTMLElement,
    tag: StoredTagConfig,
    index: number
  ): void {
    const isArchive = this.plugin.isArchiveTagIndex(index);
    const rowEl = listEl.createDiv({
      cls: `vsc-tag-list-item${isArchive ? " is-archive" : ""}`,
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
          "aria-label": "标签名",
        },
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
        text: "×",
        cls: "vsc-tag-delete-button",
        attr: { type: "button", "aria-label": "删除标签" },
      });
      deleteButton.addEventListener("click", async () => {
        await this.plugin.removeTagSetting(index);
        this.display();
      });
    }
  }

  private renderAddTagRow(listEl: HTMLElement): void {
    const footerEl = listEl.createDiv({ cls: "vsc-tag-list-footer" });
    const addButton = footerEl.createEl("button", {
      text: "新增标签",
      cls: "vsc-tag-add-button mod-cta",
      attr: { type: "button" },
    });

    addButton.disabled = this.plugin.getTagSettings().length >= MAX_TAG_CONFIGS;
    addButton.addEventListener("click", async () => {
      if (await this.plugin.addTagSetting()) this.display();
    });
  }

  private renderColorChoices(
    controlEl: HTMLElement,
    selectedColorId: TagColorId,
    onChoose: (colorId: TagColorId) => void
  ): void {
    const swatchGroup = controlEl.createDiv({
      cls: "vsc-tag-color-choices",
      attr: { role: "radiogroup", "aria-label": "标签颜色" },
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
          "data-selected": String(isSelected),
        },
      });
      button.style.setProperty("--vsc-setting-color", option.swatch);
      button.addEventListener("click", () => onChoose(option.id));
    });
  }
}
