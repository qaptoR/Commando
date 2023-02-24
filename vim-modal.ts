

import CommandoPlugin from "main";
import { Setting, FuzzySuggestModal, App, Command, Notice, Instruction, Modal } from "obsidian";
import { buffer } from "stream/consumers";



     /* -- --- --- --- --- --- *\    Commando Vim Modal
    ;;
    ;;
     \* -- --- --- --- --- --- --- --- -- */

export default class CommandoVimModal extends FuzzySuggestModal<Command> {

    plugin :CommandoPlugin;
    


         /* -- --- --- --- --- --- *\    constructor
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    constructor (app :App, plugin :CommandoPlugin) {
        super(app);
        this.plugin = plugin;
        this.updateInstructions(plugin.settings.allowVimMode);

        this.inputEl.addEventListener('keydown', (event :KeyboardEvent) => {
            if ((event.altKey || event.ctrlKey) && event.code == 'Enter') {

                // @ts-ignore
                const selection = this.chooser.selectedItem;
                // @ts-ignore
                this.onChooseItem(this.chooser.values[selection].item, event)
            }
        });
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //




         /* -- --- --- --- --- --- *\    update Instructions
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    updateInstructions (allowVimMode :boolean) {
       
        // @ts-ignore
        const vimModeEnabled :boolean = this.app.vault.config.vimMode;
        const instructions :Instruction[] = [];
        const bufferText :string = "Use Vim numeric prefix";
        const settingsText :string = "Prompt for iteration settings";
        const promptText :string = "Prompt to continue each iteration";

        if (vimModeEnabled && allowVimMode) {
            instructions.push({command: "<Enter>", purpose: bufferText});
            instructions.push({command: "<Ctrl + Enter>", purpose: promptText});
            instructions.push({command: "<Alt + Enter>", purpose: settingsText});
        } else {
            instructions.push({command: "<Enter>", purpose: settingsText});
        }

        this.setInstructions(instructions);
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //



    
         /* -- --- --- --- --- --- *\    get Items
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    getItems(): Command[] {
        
        const commands :Command[] = [];
        // @ts-ignore
        for (const command in this.app.commands.commands) {
            // @ts-ignore
            commands.push(this.app.commands.commands[command]);
        }
        return commands;
    }


    getItemText(item: Command): string {

        return item.name;
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //




         /* -- --- --- --- --- --- *\    on Choose Item
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    onChooseItem(item: Command, event: MouseEvent | KeyboardEvent): void {

        const commando = async (loopCount :number, interval :number, withPrompt :boolean) => {

            this.plugin.running = true;

            for (let i= 1; i<= loopCount; ++i) {
                if (this.plugin.breakLoop) {
                    this.plugin.breakLoop = false;
                    break;
                }
                
                this.plugin.commandoStatus_div.setText('Running Command');

                // @ts-ignore
                this.app.commands.executeCommandById(item.id);

                const waitStart = performance.now();

                if (withPrompt && i < loopCount) {

                    this.plugin.commandoStatus_div.setText('Waiting to Continue');
                    await new Promise<void>(resolve => {
                        const modal = new CommandoPromptModal( this.app, ()=> {resolve();});
                        modal.open();
                    });
                }
                
                const waitEnd = performance.now();
                const waitDuration = waitEnd - waitStart;

                const timeout = interval - waitDuration;
                if (timeout > 0) {
                    await new Promise(resolve => setTimeout(resolve, timeout));
                }
            }

            this.plugin.running = false;

            // @ts-ignore
            this.plugin.commandoStatus_div.setText(this.plugin.getKeyBufferValue());
        }


        // @ts-ignore
        const vimModeEnabled :boolean = this.app.vault.config.vimMode;

        if (vimModeEnabled && this.plugin.settings.allowVimMode && !event.altKey) {

            // @ts-ignore
            let bufferVal :string = this.plugin.getKeyBufferValue();

            // @ts-ignore
            this.app.workspace.activeEditor.editor.cm.cm.state.vim.inputState.keyBuffer = [];

            let prefix :string = "";
            for (let i= 0; i< bufferVal.length; ++i) {
                if(!/\d/.test(bufferVal[i])) break;
                prefix += bufferVal;
            }
            const parsed = parseInt(prefix);
            const repeat_amount = Number.isNaN(parsed) ? 1 : parsed;

            new Notice(repeat_amount.toString());

            const withPrompt = event.ctrlKey ? true : false;
            commando(repeat_amount, this.plugin.settings.commandDelay, withPrompt);
        } else {
            const modal = new CommandoSettingsModal(this.app, this.plugin, commando);
            modal.open();
        }

        this.close();
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //

}

    // --- --- --- --- --- ,,, --- ''' qCp ''' --- ,,, --- --- --- --- --- //



    //- --- --- --- --- --- --- --- --- --- --- --- ### --- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- ---#### --- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- --- -## --- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- --- -## --- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- --- -## --- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- ---######-- --- --- --- --- --- --- --- --- --- --- --- -//



     /* -- --- --- --- --- --- *\    Commando Prompt Modal
    ;;
    ;;
     \* -- --- --- --- --- --- --- --- -- */

class CommandoSettingsModal extends Modal {

    plugin :CommandoPlugin;
    repeat :number;
    delay :number;
    commando : (repeat :number, interval :number, prompt :boolean) => void;



         /* -- --- --- --- --- --- *\    constructor
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    constructor(app :App, plugin :CommandoPlugin, commando :(repeat :number, interval :number, prompt :boolean) => void) {
        super(app);
        this.plugin = plugin;
        this.commando = commando;

        this.repeat = 1;
        this.delay = plugin.settings.commandDelay;
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //




         /* -- --- --- --- --- --- *\    on Open
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    onOpen () :void {

        const { contentEl } = this;

        new Setting(contentEl)
        .setName("Command Repeat Count")
        .setDesc("Repeat the chosen command this number of times")
        .addText(text => {
            text.onChange(value => {
                const match = value.match(/^\d+/);
                this.repeat = match ? parseInt(match[0]) : 1;
            });
        });

        new Setting(contentEl)
        .setName("Command Repeat Delay")
        .setDesc("Repeat the chosen command after this delay\n(Leave blank for settings value)")
        .addText(text => {
            text.onChange(value => {
                const parsed = parseInt(value);
                this.delay = Number.isNaN(parsed) ? this.plugin.settings.commandDelay : parsed;
            })
        })
        
        contentEl.createEl('p', {text: "<Enter> Run all iterations"});
        contentEl.createEl('p', {text: "<Ctrl + Enter> Run with prompt each iteration"});


        contentEl.addEventListener('keypress', (event :KeyboardEvent) => {
            if (event.code == 'Enter') {
                this.commando(this.repeat, this.delay, event.ctrlKey ? true : false);
                this.close()
            }
        });
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //

}

    // --- --- --- --- --- ,,, --- ''' qCp ''' --- ,,, --- --- --- --- --- //



    //- --- --- --- --- --- --- --- --- --- --- ---######-- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- --##--- ##- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- --- --- ##- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- --- --##--- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- ---###- --- --- --- --- --- --- --- --- --- --- --- --- -//
    //- --- --- --- --- --- --- --- --- --- --- -########## --- --- --- --- --- --- --- --- --- --- --- -//



     /* -- --- --- --- --- --- *\    Command Prompt Modal
    ;;
    ;;
     \* -- --- --- --- --- --- --- --- -- */

class CommandoPromptModal extends Modal {

    promiseCallback :() => void;



         /* -- --- --- --- --- --- *\    constructor
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    constructor (app :App, promiseCallback :() => void) {
        super(app);
        this.promiseCallback = promiseCallback;
    }


    onOpen(): void {

        this.contentEl.createEl('h1', {text: "Continue?"});
        this.contentEl.createEl('p', {text: "<Ctrl-C> to set break instruction"});
        this.contentEl.createEl('p', {text: "<Enter> or <Tab> to continue"});
        this.contentEl.createEl('p', {text: "If the modal closes it will continue automatically"})

        this.contentEl.addEventListener('keydown', (event :KeyboardEvent) => {
            if (event.code == 'Tab' || event.code == "Enter") {
                this.close();
            }
        });


        this.contentEl.setAttribute('tabindex', '0');
        this.contentEl.focus();
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //

    


         /* -- --- --- --- --- --- *\    on Close
        ()
        ()
         \* -- --- --- --- --- --- --- --- -- */
    
    onClose(): void {
        
        this.promiseCallback();
        this.contentEl.empty();
    }

        // --- --- --- --- --- ,,, --- ''' qFp ''' --- ,,, --- --- --- --- --- //

}

    // --- --- --- --- --- ,,, --- ''' qCp ''' --- ,,, --- --- --- --- --- //


    
