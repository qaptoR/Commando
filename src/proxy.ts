

import { WorkspaceLeaf } from 'obsidian';





// Yb    dP w           888b.                         .d88b.        w    w              
//  Yb  dP  w 8d8b.d8b. 8  .8 8d8b .d8b. Yb dP Yb  dP YPwww. .d88b w8ww w8ww .d88b 8d8b 
//   YbdP   8 8P Y8P Y8 8wwP' 8P   8' .8  `8.   YbdP      d8 8.dP'  8    8   8.dP' 8P   
//    YP    8 8   8   8 8     8    `Y8P' dP Yb   dP   `Y88P' `Y88P  Y8P  Y8P `Y88P 8    
//                                              dP                                      

export const vim_proxy_setter = function (target :any, prop :string, value :any, receiver :any) {

    if ('isProxy' in target && prop == "status") {


        const maxBuffer :number = this.settings.maxVimBuffer;
        
        if (maxBuffer != 0) {
        const match = /^\d+/.exec(value);
        if (match && match[0].length > maxBuffer) {
            const diff = match[0].length - maxBuffer;
            value = value.substring(diff);
            for (let i= 0; i< diff; ++i) target.inputState.keyBuffer.shift();
        } }
        
        this.commandoStatus_div.setText(value);
    }

    target[prop] = value;
    return true;
}




// .d88b.        w   .d88b.  w        8    8       888b.                         
// YPwww. .d88b w8ww YPwww. w8ww .d88 88b. 8 .d88b 8  .8 8d8b .d8b. Yb dP Yb  dP 
//     d8 8.dP'  8       d8  8   8  8 8  8 8 8.dP' 8wwP' 8P   8' .8  `8.   YbdP  
// `Y88P' `Y88P  Y8P `Y88P'  Y8P `Y88 88P' 8 `Y88P 8     8    `Y8P' dP Yb   dP   
//                                                                         dP    

export const set_stable_proxy = function (leaf :WorkspaceLeaf) {

    // @ts-ignore
    if (!self.app.vault.config.vimMode) return;

    // @ts-ignore
    if ( leaf.view.editor == null ) {
        return;
    }

    // @ts-ignore
    if ('isProxy' in leaf.view.editor.cm.cm.state.vim) return;
    
    // @ts-ignore
    const target = leaf.view.editor.cm.cm.state.vim;
    const proxy = new Proxy(
        target, {
        set: vim_proxy_setter.bind(this)
    })

    proxy.isProxy = true;

    // @ts-ignore
    leaf.view.editor.cm.cm.state.vim = proxy;
}