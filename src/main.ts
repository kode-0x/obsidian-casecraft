import { Editor, Plugin } from "obsidian";
import {
	CasecraftSettings,
	CasecraftSettingTab,
	DEFAULT_SETTINGS,
} from "./settings";
import { toCapitalizedCase } from "./transform";

export default class CasecraftPlugin extends Plugin {
	settings: CasecraftSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerEvent(
			this.app.workspace.on("editor-paste", (evt: ClipboardEvent, editor: Editor) => {
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

				const transformed = toCapitalizedCase(text, {
					excludedWords: this.settings.excludedWords,
				});

				editor.replaceSelection(transformed);
			})
		);

		this.addCommand({
			id: "capitalize-selection",
			name: "Capitalize selected text",
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				if (!selection) {
					return;
				}

				const transformed = toCapitalizedCase(selection, {
					excludedWords: this.settings.excludedWords,
				});

				editor.replaceSelection(transformed);
			},
		});

		this.addSettingTab(new CasecraftSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
