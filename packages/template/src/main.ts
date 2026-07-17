import {
    Editor,
    MarkdownFileInfo,
    MarkdownView,
    Modal,
    Notice,
    Plugin,
} from 'obsidian';
import {
    DEFAULT_SETTINGS,
    MyPluginSettings,
    SampleSettingTab,
} from './settings';

export default class MyPlugin extends Plugin {
	settings!: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dice', '{{PLUGIN_NAME}}', (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('{{PLUGIN_NAME}} is ready!');
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('{{PLUGIN_NAME}}');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: '{{PLUGIN_ID}}-open-modal',
			name: 'Open modal',
			callback: () => {
				new SampleModal(this.app).open();
			},
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: '{{PLUGIN_ID}}-replace-selected',
			name: 'Replace selected content',
			editorCallback: (
				editor: Editor,
				_ctx: MarkdownView | MarkdownFileInfo,
			) => {
				editor.replaceSelection('{{PLUGIN_NAME}} editor command');
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(activeDocument, 'click', (_evt: MouseEvent) => {
			new Notice('{{PLUGIN_NAME}} click');
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log('interval'), 5 * 60 * 1000),
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
