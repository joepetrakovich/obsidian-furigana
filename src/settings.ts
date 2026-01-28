import FuriganaPlugin from "main";
import { App, PluginSettingTab, SettingGroup } from "obsidian";

export interface PluginSettings {
	showOnHover: boolean,
	fontSize: number;
	fontColor: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	showOnHover: false,
	fontSize: 10,
	fontColor: "var(--text-normal)"
}

export class SettingTab extends PluginSettingTab {
	plugin: FuriganaPlugin;

	constructor(app: App, plugin: FuriganaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new SettingGroup(containerEl)
			.addSetting(setting => setting
				.setName('Only show on hover')
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.showOnHover)
					.onChange(async (value) => {
						this.plugin.settings.showOnHover = value;
						await this.plugin.saveSettings();
						this.plugin.loadStyles();
						this.display();
					})
				))
			.addSetting(setting => setting
				.setName('Font size')
				.addSlider(slider => slider
					.setDynamicTooltip()
					.setValue(this.plugin.settings.fontSize)
					.setLimits(1, 36, 1)
					.onChange(async (value) => {
						this.plugin.settings.fontSize = value;
						await this.plugin.saveSettings();
						this.plugin.loadStyles();
						this.display();
					})
				))
			.addSetting(setting => setting
				.setName('Font color')
				.addExtraButton(button => button
					.setDisabled(this.plugin.settings.fontColor === DEFAULT_SETTINGS.fontColor)
					.setIcon('rotate-ccw')
					.setTooltip('Restore default')
					.onClick(async () => {
						this.plugin.settings.fontColor = DEFAULT_SETTINGS.fontColor;
						await this.plugin.saveSettings();
						this.plugin.loadStyles();
						this.display();

					})
					.extraSettingsEl.setAttribute('aria-disabled', button.disabled ? 'true' : 'false')
				)
				.addColorPicker(color => {
					let currentValue = this.plugin.settings.fontColor;
					if (currentValue === DEFAULT_SETTINGS.fontColor) {
						currentValue = getComputedStyle(document.body)
							.getPropertyValue('--text-normal')
							.trim();
					}
					color
						.setValue(currentValue)
						.onChange(async (value) => {
							this.plugin.settings.fontColor = value;
							await this.plugin.saveSettings();
							this.plugin.loadStyles();
							this.display();
						})
				}));

		new SettingGroup(containerEl)
			.addSetting(setting => {
				setting.setName("Preview")
				if (this.plugin.settings.showOnHover) {
					setting.setDesc("Hover over the kanji with your mouse to reveal the furigana.");
				}
				const span = setting.controlEl.createSpan();
				span.createEl('ruby', { text: '今日' })
					.createEl('rt', { cls: 'furigana', attr: { 'data-rt': 'きょう' } });
				span.appendText('は');
				span.createEl('ruby', { text: '素晴' })
					.createEl('rt', { cls: 'furigana', attr: { 'data-rt': 'すば' } });
				span.appendText('らしいと');
				span.createEl('ruby', { text: '思' })
					.createEl('rt', { cls: 'furigana', attr: { 'data-rt': 'おも' } });
				span.appendText('います。');
			});
	}
}
