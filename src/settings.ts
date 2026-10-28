import { App, PluginSettingTab, Setting } from "obsidian";
import type CasecraftPlugin from "./main";

export interface CasecraftSettings {
	enabled: boolean;
	excludedWords: string[];
}

export const DEFAULT_SETTINGS: CasecraftSettings = {
	enabled: true,
	excludedWords: [],
};

export function parseExcludedWords(raw: string): string[] {
	return raw
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}

export class CasecraftSettingTab extends PluginSettingTab {
	private plugin: CasecraftPlugin;

	constructor(app: App, plugin: CasecraftPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Transform on paste")
			.setDesc("Convert pasted text to Capitalized Case automatically.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
					this.plugin.settings.enabled = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Excluded words")
			.setDesc("One word per line. Matching words are left unchanged.")
			.addTextArea((text) => {
				text
					.setPlaceholder("API\nAI\niPhone")
					.setValue(this.plugin.settings.excludedWords.join("\n"))
					.onChange(async (value) => {
						this.plugin.settings.excludedWords = parseExcludedWords(value);
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 8;
				text.inputEl.classList.add("casecraft-excluded-words");
			});
	}
}
