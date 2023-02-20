

import { FuzzySuggestModal, App, Command, Notice, Instruction } from "obsidian";



export default class CommandoVimModal extends FuzzySuggestModal<Command> {

    constructor (app :App, allow :boolean) {
        super(app);

        this.updateInstructions(allow);
    }


    updateInstructions (allowVimMode :boolean) {
        
        const instructions :Instruction[] = [];
        const bufferText :string = "Use Vim numeric prefix buffer for loop iterations";
        const promptText :string = "Prompt for loop iterations";

        if (allowVimMode) {
            instructions.push({command: "<Enter>", purpose: bufferText});
            instructions.push({command:"<Alt + Enter>", purpose: promptText});
        } else {
            instructions.push({command: "<Enter>", purpose: promptText});
        }

        this.setInstructions(instructions);
    }


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


    onChooseItem(item: Command, evt: MouseEvent | KeyboardEvent): void {

        // @ts-ignore
        let buffer_val = this.app.workspace.activeEditor?.editor?.cm?.cm?.state?.vim?.inputState?.keyBuffer;
        // @ts-ignore
        this.app.workspace.activeEditor.editor.cm.cm.state.vim.inputState.keyBuffer = "";

        const match_result = buffer_val.match(/^\d+/);
        const repeat_amount = match_result ? parseInt(match_result[0]) : 1;

        new Notice(repeat_amount.toString());
        const commando = async () => {
            for (let i= 0; i< repeat_amount; ++i) {
                // @ts-ignore
                this.app.commands.executeCommandById(item.id);
                await new Promise(resolve => setTimeout(resolve, 250));
                // await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        commando();
        this.close();
    }
}




// Allow Vim Mode: TRUE
//   if VIM enabled: 
//     <enter>: run command with vim buffer
//     <alt+enter>: prompt for loop count
//   if VIM disabled:
//     <enter>: prompt for loop count
//
// Allow Vim Mode: FALSE
//  <enter>: prompt for loop count