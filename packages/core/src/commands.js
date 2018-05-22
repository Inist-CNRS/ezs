import assert from 'assert';

export default class Commands {
    constructor(commands) {
        assert(Array.isArray(commands), 'Commands should be an array.');
        this.commands = commands;
        this.useCommands = this.commands.filter(c => c.name === 'use');
    }
    getUseCommands() {
        return this.useCommands;
    }
    get() {
        return this.commands;
    }
    analyse() {
        const newCmds = [];
        let first = true;
        let previousMode = '';
        this.commands
            .filter(c => c.name !== 'use')
            .forEach((c) => {
                const currentMode = c.mode === 'divisible' ? 'dispatch' : 'pipeline';
                if (currentMode !== previousMode) {
                    if (currentMode === 'dispatch' || first) {
                        newCmds.push({
                            func: currentMode,
                            cmds: [...this.useCommands, c],
                        });
                    } else {
                        newCmds.push({
                            func: currentMode,
                            cmds: [c],
                        });
                    }
                } else {
                    const idx = newCmds.length - 1;
                    newCmds[idx].cmds.push(c);
                }
                previousMode = currentMode;
                first = false;
            });
        return newCmds;
    }
}
