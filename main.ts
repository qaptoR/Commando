


import { Plugin, WorkspaceLeaf } from 'obsidian';
import CommandoVimModal from 'vim-modal';
import CommandSettingTab from 'settings';


interface CommandoSettings {
	maxVimBuffer: number,
    allowVimMode: boolean

}

const DEFAULT_SETTINGS: Partial<CommandoSettings> = {
	maxVimBuffer: 3,
    allowVimMode: true
}




     /* -- --- --- --- --- --- *\    Command Plugin
    ;;
    ;;
     \* -- --- --- --- --- --- --- --- -- */

export default class CommandoPlugin extends Plugin {

	settings: CommandoSettings;
    
    commandoVimModal :CommandoVimModal;
    keyBuffer_div :HTMLElement;




         /* -- --- --- --- --- --- *\    update Commando Vim Modal
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    updateCommandoVimModal (allowVimMode :boolean) {

        this.commandoVimModal = new CommandoVimModal(this.app, allowVimMode);
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //




         /* -- --- --- --- --- --- *\    on load
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
	async onload() {

        const self = this;
        // required for proxy set() trap closure to reliably access 'keyBuffer_div'

        
        
    //  SETTINGS TAB
		await this.loadSettings();
        this.addSettingTab(new CommandSettingTab(this.app, this));


    //  ADD COMMANDO MODAL
        this.updateCommandoVimModal(this.settings.allowVimMode);

        
    //  ADD COMMAND
        this.addCommand({
            id: "commando-repeat-command",
            name: "Commando Command Palette",
            callback: () => {
                this.commandoVimModal.open()
            }
        });


    //  STATUS BAR KEYBUFFER TEXT
        const keyBuffer_status = this.addStatusBarItem();
        this.keyBuffer_div = keyBuffer_status.createEl('div', {text: "999"});


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
                                
                                const match = value.match(/^\d+/);                                
                                if (match && match[0].length >2) {
                                // Truncating the keyBuffer to only max 2 #'s.
                                // During testing, it was realized that cm vim implementation has
                                // not limit and obsidian can freeze due to extremely large requests.
                                // Providing a setting which can override this functionality.

                                    const stripLen = match[0].length - (match[0].length -2);
                                    value = value.replace(value.substr(0, stripLen), "");
                                }

                                self.keyBuffer_div.setText(value);
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
        this.app.workspace.iterateAllLeaves(leaf => {
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
