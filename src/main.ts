import { Editor, MarkdownFileInfo, MarkdownView, Plugin } from "obsidian";
import {
	CasecraftSettings,
	CasecraftSettingTab,
	DEFAULT_SETTINGS,
} from "./settings";
import { toCapitalizedCase } from "./transform";

export default class CasecraftPlugin extends Plugin {
	settings!: CasecraftSettings;

	async onload() {
		await this.loadSettings();

		// Transform clipboard text as it is pasted into the editor.
		this.registerEvent(
			this.app.workspace.on(
				"editor-paste",
				(evt: ClipboardEvent, editor: Editor) => {
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
				},
			),
		);

		// Editor command to transform the current selection on demand.
		this.addCommand({
			id: "capitalize-selection",
			name: "Capitalize selected text",
			editorCallback: (
				editor: Editor,
				_ctx: MarkdownView | MarkdownFileInfo,
			) => {
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

	private transform(text: string): string {
		return toCapitalizedCase(text, {
			excludedWords: this.settings.excludedWords,
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<CasecraftSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
