

import { Plugin,  } from 'obsidian';
import CommandoVimModal from 'src/vim-modal';
import CommandSettingTab from 'src/settings';
import { set_stable_proxy } from './proxy';


interface CommandoSettings {
	maxVimBuffer :number,
    commandDelay :number
    allowVimMode :boolean

}

const DEFAULT_SETTINGS: Partial<CommandoSettings> = {
	maxVimBuffer: 3,
    commandDelay: 250,
    allowVimMode: true
}




     /* -- --- --- --- --- --- *\    Command Plugin
    ;;
    ;;
     \* -- --- --- --- --- --- --- --- -- */

export default class CommandoPlugin extends Plugin {

	settings: CommandoSettings;
    
    commandoVimModal :CommandoVimModal;
    commandoStatus_div :HTMLElement;
    running :boolean = false;
    breakLoop :boolean = false;
    bufferValue :number



         /* -- --- --- --- --- --- *\    check Vim Mode
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    checkVimMode () {
        // @ts-ignore
        return this.app.vault.config.get('vimMode');
    }
    
        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //




         /* -- --- --- --- --- --- *\    get Key Buffer Value
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    getKeyBufferValue () {

        let bufferVal :any;

        // @ts-ignore
        if (this.app.workspace.activeEditor.editor == null || !this.app.vault.config.vimMode) {
            bufferVal = [];

        // @ts-ignore
        } else {
            
            // @ts-ignore
            bufferVal = this.app.workspace.activeEditor.editor.cm.cm.state.vim.inputState.keyBuffer;
    
            if (!bufferVal) {
                bufferVal = [];
            } 

        }

        return bufferVal;
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //




         /* -- --- --- --- --- --- *\    on load
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
	async onload() {

        console.log("Loading Plugin Commando");

        
    //  SETTINGS TAB
		await this.loadSettings();
        this.addSettingTab(new CommandSettingTab(this.app, this));

        this.registerDomEvent(document, 'keydown', (event :KeyboardEvent) => {
            if (event.ctrlKey && event.key == 'c' && this.running && !this.breakLoop) {
                this.breakLoop = true;
            }
        });

        
    //  ADD COMMAND
        this.addCommand({
            id: "equip-commando-paletter",
            name: "Equip Commando Palette",
            callback: () => {
                if (this.running) return;

                const modal = new CommandoVimModal(this.app, this);
                modal.open()
            }
        });


    //  STATUS BAR KEYBUFFER TEXT
        const keyBuffer_status = this.addStatusBarItem();
        this.commandoStatus_div = keyBuffer_status.createEl('div', {text: ""});




    //  REGISTER EVENT AND PROXIES
        this.app.workspace.iterateAllLeaves(set_stable_proxy.bind(this));
        this.registerEvent(this.app.workspace.on('active-leaf-change', set_stable_proxy.bind(this)));

	}

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //




         /* -- --- --- --- --- --- *\    on unload
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
	onunload() {

        const self = this;

        this.app.workspace.iterateAllLeaves(leaf => {

            // @ts-ignore
            if (!self.app.vault.config.vimMode) return;

            // @ts-ignore
            if (leaf.view.editor == null) return;

            // @ts-ignore
            if (!Object.hasOwn(leaf.view.editor.cm.cm.state.vim, 'isProxy')) return;

            // @ts-ignore
            delete leaf.view.editor.cm.cm.state.vim.isProxy;
        });
	}

        // --- --- --- --- --- ,,, --- ''' qfp ''' --- ,,, --- --- --- --- --- //




         /* -- --- --- --- --- --- *\    load / save Settings
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}


	async saveSettings() {
		await this.saveData(this.settings);
	}

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //

}

    // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //
