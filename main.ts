

import { Plugin, WorkspaceLeaf } from 'obsidian';
import CommandoVimModal from 'vim-modal';
import CommandSettingTab from 'settings';
import { buffer } from 'stream/consumers';
import { isProxy } from 'util/types';


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



         /* -- --- --- --- --- --- *\    check Vim Mode
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    checkVimMode () {
        // @ts-ignore
        return this.app.vault.config.vimMode;
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

        const self = this;
        // required for proxy set() trap closure to reliably access 'commandoStatus_div'
        
        
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
            id: "commando-repeat-command",
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


    //  BUFFER PROXY SETTER
        const vim_proxy_setter = function (target :any, prop :string, value :any, receiver :any) {
    
            if ('isProxy' in target && prop == "status") {


                const maxBuffer :number = self.settings.maxVimBuffer;
                
                if (maxBuffer != 0) {
                const match = /^\d+/.exec(value);
                if (match && match[0].length > maxBuffer) {
                    const diff = match[0].length - maxBuffer;
                    value = value.substring(diff);
                    for (let i= 0; i< diff; ++i) target.inputState.keyBuffer.shift();
                } }
                
                self.commandoStatus_div.setText(value);
            }

            target[prop] = value;
            return true;
        }


    //  ROOT PROXY 
        const set_stable_proxy = function (leaf :WorkspaceLeaf) {

            // @ts-ignore
            if (!self.app.vault.config.vimMode) return;

            // @ts-ignore
            if ( leaf.view.editor == null ) {
                return;
            }

            // @ts-ignore
            if ('isProxy' in leaf.view.editor.cm.cm.state.vim) return;
            // if ('isProxy' in leaf.view.editor.cm.cm.state.vimPlugin) return;
            
            // @ts-ignore
            const target = leaf.view.editor.cm.cm.state.vim;
            // const target = leaf.view.editor.cm.cm.state.vimPlugin;
            const proxy = new Proxy(
                target, {
                set: vim_proxy_setter
            })

            proxy.isProxy = true;

            // @ts-ignore
            leaf.view.editor.cm.cm.state.vim = proxy;
            // leaf.view.editor.cm.cm.state.vimPlugin = proxy;
        }


    //  REGISTER EVENT AND PROXIES
        this.app.workspace.iterateAllLeaves(set_stable_proxy);
        this.registerEvent(this.app.workspace.on('active-leaf-change', set_stable_proxy));

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
