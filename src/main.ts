import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings, SettingTab } from "./settings";
import kuromoji from "./vendor/kuromoji";
import { sanitizeToken } from "./token-rules";
import { fontStyle, renderRuby, showOnHoverStyle } from "./common";
import { dataFiles } from './data/index.js'

export default class FuriganaPlugin extends Plugin {
	settings: PluginSettings;
	styleEl: HTMLElement;

	async onload() {
		await this.loadSettings();

		this.loadStyles();

		this.addSettingTab(new SettingTab(this.app, this));

		this.registerMarkdownPostProcessor(async (element, context) => {
		    const tokenizer = await kuromoji.builder({ inMemoryDicFiles: dataFiles }).build();

			let walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
			let currentNode: Node | null = walker.nextNode();
			while (currentNode) {
				const text = currentNode.nodeValue?.trim();
				if (text) {
					const token = tokenizer.tokenize(text);
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
}


