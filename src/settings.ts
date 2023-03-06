

import { PluginSettingTab, App, Setting } from "obsidian";
import CommandoPlugin from "main";



     /* -- --- --- --- --- --- *\    Sameple Setting Tab
    ;;
    ;;
     \* -- --- --- --- --- --- --- --- -- */

export default class CommandSettingTab extends PluginSettingTab {

	plugin: CommandoPlugin;


	constructor(app: App, plugin: CommandoPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}


	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Commando Setting'});

		const maxVimBuffer = new Setting(containerEl);
        maxVimBuffer
        .setName(`Max Vim Buffer: ${this.plugin.settings.maxVimBuffer}`)
        .setDesc("Max size of Vim numeric prefix buffer")
        .addSlider(slider => slider
            .setValue(this.plugin.settings.maxVimBuffer)
            .setDynamicTooltip()
            .setLimits(0, 10, 1)
            .onChange(async (value) => {
                this.plugin.settings.maxVimBuffer = value;
                maxVimBuffer.setName(`Max Vim Buffer: ${this.plugin.settings.maxVimBuffer}`);
                await this.plugin.saveSettings();
        }));

        const commandDelay = new Setting(containerEl);
        commandDelay
        .setName(`Command Delay: ${this.plugin.settings.commandDelay}`)
        .setDesc("The time delay in ms between each command iteration")
        .addText(text => text
            .onChange(async (value) => {
                const parsed = parseInt(value);
                this.plugin.settings.commandDelay = Number.isNaN(parsed) ? 250 : parsed;
                commandDelay.setName(`Command Delay: ${this.plugin.settings.commandDelay}`);
                await this.plugin.saveSettings();
        }));

        const allowVimMode = new Setting(containerEl);
        allowVimMode
        .setName("Allow Vim Mode")
        .setDesc("Enables using vim numeric prefix buffer for loop iterations")
        .addToggle(toggle => toggle
            .setValue(this.plugin.settings.allowVimMode)
            .onChange(async (value) => {
                this.plugin.settings.allowVimMode = value;
                await this.plugin.saveSettings();
        }));
	}
}

    // --- --- --- --- --- ,,, --- ''' qCp ''' --- ,,, --- --- --- --- --- //