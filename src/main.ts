import { Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings, SettingTab } from "./settings";
import kuromoji from "kuromoji";
import type { Tokenizer } from "./types";
import { sanitizeToken, fontStyle, renderRuby, showOnHoverStyle } from "./kana-utils.js";
import DictionaryManager from 'dictionary-manager';

export default class FuriganaPlugin extends Plugin {
	settings: PluginSettings;
	dictionaryManager: DictionaryManager;
	styleEl: HTMLElement;
	private tokenizer: Tokenizer;

	async onload() {
		await this.loadSettings();
		this.loadStyles();
		this.dictionaryManager = new DictionaryManager(this);
		this.addSettingTab(new SettingTab(this.app, this));

		this.registerMarkdownPostProcessor(async (element) => {
			await this.loadTokenizer();

			if (!this.tokenizer) return;

			let walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
			let currentNode: Node | null = walker.nextNode();
			while (currentNode) {
				const text = currentNode.nodeValue?.trim();
				if (text) {
					const token = this.tokenizer.tokenize(text);
					const textWithFuriganaMarkup = renderRuby(text, sanitizeToken(token));
					const el = document.createElement('div');
					el.innerHTML = textWithFuriganaMarkup;
					for (const child of Array.from(el.childNodes)) {
						currentNode.parentNode?.insertBefore(child, currentNode);
					}
					el.remove();
					currentNode.nodeValue = null;
				}

				currentNode = walker.nextNode();
			}
		});
	}

	onunload() {
		if (this.styleEl) {
			this.styleEl.remove();
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<PluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	loadStyles() {
		if (this.styleEl) {
			this.styleEl.remove();
		}

		const { showOnHover, fontSize, fontColor } = this.settings;
		const styles = fontStyle(fontSize, fontColor) + (showOnHover ? showOnHoverStyle : '');

		this.styleEl = document.head.createEl('style');
		this.styleEl.nodeValue = '';
		this.styleEl.appendText(styles)
	}

	async loadTokenizer() {
		if (this.tokenizer) return;

		const dict = await this.dictionaryManager.loadDictionary();
		if (!dict) {
			new Notice("Dictionary missing.  Download from settings.");
			return;
		}

		this.tokenizer = await kuromoji.builder({ inMemoryDicFiles: dict }).build();
	}
}


