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

			let walker = activeDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
			let currentNode: Node | null = walker.nextNode();
			while (currentNode) {
				const parent = currentNode.parentElement;
				if (parent?.tagName?.toLowerCase() === 'ruby' || parent?.tagName?.toLowerCase() === 'rt') {
					currentNode = walker.nextNode();
					continue;
				}

				const text = currentNode.nodeValue;
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
		for (const doc of this.getAllDocs()) {
			this.removeStylesFromDoc(doc);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<PluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	

	loadStyles() {
		const { showOnHover, fontSize, fontColor } = this.settings;
		for (const doc of this.getAllDocs()) {
			this.applyStylesToDoc(doc, fontSize, fontColor, showOnHover);
		}
	}

	private applyStylesToDoc(doc: Document, fontSize: number, fontColor: string, showOnHover: boolean) {
		doc.documentElement.style.setProperty('--furigana-font-size', `${fontSize}px`);
		doc.documentElement.style.setProperty('--furigana-font-color', `${fontColor}`);
		doc.body.toggleClass('furigana-hover', showOnHover);
	}

	private removeStylesFromDoc(doc: Document) {
		doc.documentElement.style.removeProperty('--furigana-font-size');
		doc.documentElement.style.removeProperty('--furigana-font-color');
		doc.body.removeClass('furigana-hover');
	}

	private getAllDocs(): Document[] {
		const docs = new Set<Document>();
		docs.add(activeDocument);
		this.app.workspace.iterateAllLeaves((leaf) => {
			const el = leaf.view.containerEl
			if (el) {
				docs.add(el.doc)
			}
		});
		return [...docs];
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


