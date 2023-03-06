# Commando Plugin

This plugin is designed to enrich the command use experience by enabling repeated command iterations.

eg. When using 'Advanced Tables' community plguin and you need to move a row up 20 times, rather than click the button in the sidebar GUI or
repeatedly call the command exhaustively, use Commando to call the command once and have it repeat 20 times per your instruction!

Commando is so named to be reminiscent of the community plugin 'Commander' which enables creating command macros. (see also 'QuickAdd').
Macros were originally also going to be enabled by Commando, but instead I've chosen to accept help and divide and conquer!

So think of Commander as the general, and Commando as the frontline soldier in your army of plugins that help you manage you PKM.

### Disclaimer

By using Commando you do so at your own risk knowing full well that not every command Obsidian or other plugins provide should
be run in this manner.

Every command is a unique snowflake, and every care should be taken to think through what changes will be made if it is run
several to many hundreds of times in rapid succession.

It is highly recommended to have your vault under version control prior to using Commando in any way which might change or
remove files. With great power comes great responsibility.

As an added precaution, it is a good idea to pre-test running Commando with any command in a test vault before use in
a production or day to day vault.

### Special Note about Hotkeys

In order to use the Vim Buffer feature you cannot use the plugin 'Sequence HotKeys' to open the Commando Palette.
The way that plugin operates consumes the buffer before any command can be chosen from the palette.
Instead, it's recommended to set the hoteky to something like \<alt + shift + p\> using the obsidian hotkey settings.

## Features

- equip dedicated 'Commando Palette'. One command to rule them all!
- use vim numeric prefix buffer as iteration count
- set default iteration delay and optional perinvocation delay override
- optional continue iteration prompts
- instant breakout from iteration with \<Ctrl + c\>
- SEE the vim keyBuffer (and optionally limit numeric prefix buffer) in the status bar!

# Commando Palette

Nearly identical in operation to the normal command palette, with a secret weapon:

When Obsidian is in Vim Mode, the Commando Palette can use the vim numeric prefix buffer as the command iteration count.

Once a command is under selection, type any of the following:

- \<Enter\> Run the command using Prefix Buffer and delay from plugin settings
- \<Ctrl + Enter\> Run the command as above, pause after each iteration with prompt modal to continue
- \<Alt + Enter\> Bring up an instance settings modal to choose iteration count and optional delay for this invocation

IF 'Allow Vim Mode' plugin setting or Obsidian Vim Mode are turned off

- \<Enter\> Bring up an instance settings modal to choose iteration count or delay for this invocation

### Instance Settings Modal

Choose the iteration count, and optionally choose a delay for this instance run of Commando.

From this modal, type any of the following:

- \<Enter\> Run the command using the input iteration count and delay, or delay from plugin settings if empty
- \<Ctrl + Enter\> Run the command as above, pause after each iteration with prompt modal to continue

### Prompt Modal

If opted for, this per-iteration prompt offers an opportunity to assess any changes before continuing.

Don't worry though, every milisecond waiting is already counting down the delay timer, so wait times will
always be the greater of: the delay timer OR how long you waited to continue. They will never combine.

From this modal, continue by doing any of the following:

- press \<Tab\> or \<Enter\>
- change focus by navigating away with the mouse
- press \<Escape\> to close the modal

#### Instant Breakout

If at any point during a large iteration count you decide to stop iterating, type:

- \<Ctrl + c\> to instantly break out of the looping.

Pressing it before closing a Prompt Modal will also cancel the looping when the modal is closed.

# Settings

- Allow Vim Mode
- Max Vim Buffer
- Command Delay

### Allow Vim Mode

Whether you use vim keybinds or not, you are in full control of whether Commando even has the option to use
the numeric prefix buffer as ammunition.

Turning this off simplifies the Commando Palette to just one option for running commands, requiring that the
instance setting modal be used for every invocation.

### Max Vim Buffer

Have you ever had it where you were trying to do a motion with vim keybinds, but you forgot how many numbers you'd already
typed?

Well fret no more! In order to save users the frustration of accidentally calling a command 1000s of times, the vim
keyBuffer is now visible in the status bar.

Commando goes a little further though. Plugin ettings allow you to set a max vim buffer for the numeric prefix, so
that you might never again run a vim motion, or command more than 9, 99, 999 ... times again!

### Command Delay

Some commands take a second to do their job properly. Rather than rush them with potentially disastrous results,
set a consistent delay between iterations to give each command (and yourself) time to assess the changes.
