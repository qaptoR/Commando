

import { Plugin, WorkspaceLeaf } from 'obsidian';
import CommandoVimModal from 'vim-modal';
import CommandSettingTab from 'settings';
import { buffer } from 'stream/consumers';


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
            bufferVal = "";

        // @ts-ignore
        } else {
            
            // @ts-ignore
            bufferVal = this.app.workspace.activeEditor.editor.cm.cm.state.vim.inputState.keyBuffer;
    
            if (!bufferVal || bufferVal instanceof Array) {
            // keyBuffer may at times be undefined or [] 
                bufferVal = "";
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


    //  PROXY RE-SETTER
        const unstable_proxy_setter = function (target :any, prop :string, value :any, reciever :any) {
        // Watches for the changes in the 'keyBuffer' in order to take action.
        // This method was chosen over polling to improve performance.

            if ('isProxy' in target && prop == 'inputState') {
            // ^^^ will stop work on unload since there is no way to reverse a proxy.
            // All proxies are erased when an editor closes or opens a new file (even moving forward or back),
            // so after the plugin is disabled proxies will persist for unobtrusively short period.
            // Closing all editors or reopening vault will clear them immediately otherwise.


                if ( !('isProxy' in value) ) {
                // set may be called multiple times for inputState, but proxy is set only once
                    value = new Proxy(value, {
                        set(target, prop, value, reciever) {

                            if (prop == 'keyBuffer') {

                                const maxBuffer :number = self.settings.maxVimBuffer;
                                
                                if (maxBuffer != 0) {
                                    const match = value.match(/^\d+/);                                
                                    if (match && match[0].length > maxBuffer) {
                                        // Truncating the keyBuffer to only max 2 #'s.
                                        // During testing, it was realized that cm vim implementation has
                                        // not limit and obsidian can freeze due to extremely large requests.
                                        // Providing a setting which can override this functionality.
                                        
                                        const stripLen = match[0].length - (match[0].length - maxBuffer);
                                        value = value.replace(value.substr(0, stripLen), "");
                                    }
                                }

                                self.commandoStatus_div.setText(value);
                            }
                            target[prop] = value;
                            return true;
                        }
                    });

                    value.isProxy = true;
                }
            }
            target[prop] = value;
            return true;
        }
    

    //  ROOT PROXY 
        const set_stable_proxy = function (leaf :WorkspaceLeaf) {
        // beecuase the 'inputState' proxy will be removed whenever the keyBuffer is consumed or wiped
        // the 'cm.cm.state.vim' proxy set here watches for those changes.

            // @ts-ignore
            if (!self.app.vault.config.vimMode) return;

            // @ts-ignore
            if ( leaf.view.editor == null ) {
                return;
            }

            // @ts-ignore
            if ('isProxy' in leaf.view.editor.cm.cm.state.vim) return
            
            // @ts-ignore
            const target = leaf.view.editor.cm.cm.state.vim;
            const proxy = new Proxy(
                target, {
                set: unstable_proxy_setter
            })

            proxy.isProxy = true;

            // @ts-ignore
            leaf.view.editor.cm.cm.state.vim = proxy;
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
