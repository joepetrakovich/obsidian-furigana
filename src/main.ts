import { Notice, Plugin, sanitizeHTMLToDom } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings, SettingTab } from "./settings";
import kuromoji, { Tokenizer } from "kuromoji";
import { sanitizeToken, renderRuby } from "./kana-utils.js";
import DictionaryManager from 'dictionary-manager';

export default class FuriganaPlugin extends Plugin {
	settings: PluginSettings;
	dictionaryManager: DictionaryManager;
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
					const textWithFuriganaMarkup = sanitizeHTMLToDom(renderRuby(text, sanitizeToken(token)));
					currentNode.parentNode?.insertBefore(textWithFuriganaMarkup, currentNode);
					currentNode.nodeValue = null;
				}

				currentNode = walker.nextNode();
			}
		});
	}

	onunload() {
		document.documentElement.style.removeProperty('--furigana-font-size');
		document.documentElement.style.removeProperty('--furigana-font-color');
		document.body.removeClass('furigana-hover');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<PluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	loadStyles() {
		const { showOnHover, fontSize, fontColor } = this.settings;

		document.documentElement.style.setProperty('--furigana-font-size', `${fontSize}px`);
		document.documentElement.style.setProperty('--furigana-font-color', `${fontColor}`);
		document.body.toggleClass('furigana-hover', showOnHover);
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


