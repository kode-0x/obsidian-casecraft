"use strict";

const obsidian = require("obsidian");

const DEFAULT_SETTINGS = {
    enabled: true,
    excludedWords: [],
};

// Matches block ($$...$$) and inline ($...$) LaTeX math so it can be preserved.
const LATEX_PATTERN = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g;

function parseExcludedWords(raw) {
    return raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

function buildExclusionSet(excludedWords) {
    const set = new Set();
    for (const word of excludedWords) {
        const trimmed = word.trim();
        if (trimmed.length > 0) {
            set.add(trimmed);
        }
    }
    return set;
}

function capitalizeWord(word) {
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (char && /[a-zA-Z]/.test(char)) {
            return (
                word.slice(0, i) +
                char.toUpperCase() +
                word.slice(i + 1).toLowerCase()
            );
        }
    }
    return word;
}

function transformSegment(segment, exclusions) {
    return segment.replace(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu, (token) => {
        if (exclusions.has(token)) {
            return token;
        }
        return capitalizeWord(token);
    });
}

function toCapitalizedCase(input, options) {
    const exclusions = buildExclusionSet(options.excludedWords);
    const parts = input.split(LATEX_PATTERN);

    return parts
        .map((part, index) => {
            // Odd indices are the captured LaTeX segments; leave them untouched.
            if (index % 2 === 1) {
                return part;
            }
            return transformSegment(part, exclusions);
        })
        .join("");
}

class CasecraftSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;

        containerEl.empty();

        new obsidian.Setting(containerEl)
            .setName("Transform on paste")
            .setDesc("Automatically convert pasted text to capitalized case.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enabled)
                    .onChange(async (value) => {
                        this.plugin.settings.enabled = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new obsidian.Setting(containerEl)
            .setName("Excluded words")
            .setDesc("One word per line. Matching words are left unchanged.")
            .addTextArea((text) => {
                text
                    .setPlaceholder("API\nAI\niPhone")
                    .setValue(this.plugin.settings.excludedWords.join("\n"))
                    .onChange(async (value) => {
                        this.plugin.settings.excludedWords =
                            parseExcludedWords(value);
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 8;
                text.inputEl.addClass("casecraft-excluded-words");
            });
    }
}

class CasecraftPlugin extends obsidian.Plugin {
    async onload() {
        await this.loadSettings();

        // Transform clipboard text as it is pasted into the editor.
        this.registerEvent(
            this.app.workspace.on("editor-paste", (evt, editor) => {
                if (!this.settings.enabled) {
                    return;
                }

                if (evt.defaultPrevented) {
                    return;
                }

                const clipboard = evt.clipboardData;
                if (!clipboard) {
                    return;
                }

                const text = clipboard.getData("text/plain");
                if (!text) {
                    return;
                }

                evt.preventDefault();

                editor.replaceSelection(this.transform(text));
            }),
        );

        // Editor command to transform the current selection on demand.
        this.addCommand({
            id: "capitalize-selection",
            name: "Capitalize selected text",
            editorCallback: (editor) => {
                const selection = editor.getSelection();
                if (!selection) {
                    return;
                }

                editor.replaceSelection(this.transform(selection));
            },
        });

        this.addSettingTab(new CasecraftSettingTab(this.app, this));
    }

    onunload() { }

    transform(text) {
        return toCapitalizedCase(text, {
            excludedWords: this.settings.excludedWords,
        });
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

module.exports = CasecraftPlugin;
