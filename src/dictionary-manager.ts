import { normalizePath, Notice, requestUrl } from "obsidian";
import * as zip from "@zip.js/zip.js";
import FuriganaPlugin from "main";
import { DEFAULT_SETTINGS } from "settings";

export type DataFile = { name: string, data: Uint8Array<ArrayBufferLike> };

export default class DictionaryManager {
	private plugin: FuriganaPlugin;
	private readonly dataDownloadUrl = `https://github.com/joepetrakovich/obsidian-furigana/releases/download/${DEFAULT_SETTINGS.dataDownloadVersionTag}/data.zip`;
	dictFiles: DataFile[] | undefined;

	constructor(plugin: FuriganaPlugin) {
		this.plugin = plugin;
	}

	async isDownloaded() {
		return await this.plugin.app.vault.adapter.exists(this.getDataPath());
	}

	getDataPath(...subPaths: string[]) {
		return normalizePath([
			this.plugin.manifest.dir,
			'data',
			...subPaths
		].join('/'));
	}

	async downloadDictionary(): Promise<void> {
		new Notice('Downloading dictionary...');

		await this.plugin.app.vault.adapter.mkdir(this.getDataPath());

		const dataZip = await requestUrl(this.dataDownloadUrl);
		const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(dataZip.arrayBuffer)));
		const entries = await reader.getEntries();

		for (const entry of entries) {
			if (entry.directory) continue;

			const data = await entry.getData(new zip.Uint8ArrayWriter());
			await this.plugin.app.vault.adapter.writeBinary(this.getDataPath(entry.filename), data.buffer);
		}

		new Notice('Download completed.');
	}


	async loadDictionary(): Promise<DataFile[] | undefined> {
		if (this.dictFiles) {
			return this.dictFiles;
		}

		const fileNames = [
			'base.dat',
			'cc.dat',
			'check.dat',
			'tid.dat',
			'tid_map.dat',
			'tid_pos.dat',
			'unk.dat',
			'unk_char.dat',
			'unk_compat.dat',
			'unk_invoke.dat',
			'unk_map.dat',
			'unk_pos.dat',
		];

		const dictFiles = [];

		try {
			for (const fileName of fileNames) {
				const data = await this.plugin.app.vault.adapter.readBinary(this.getDataPath(fileName));
				dictFiles.push({ name: fileName, data: new Uint8Array(data) });
			}
			this.dictFiles = dictFiles;
		} catch (error) {
			console.log("Error loading dictionary: ", error);
			this.dictFiles = undefined;
		}

		return this.dictFiles;
	}
}
