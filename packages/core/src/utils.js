export const commander = ezs => (stream, command) => {
    if (command.opt && typeof ezs[command.opt] === 'function') {
        return stream.pipe(ezs[command.opt](command.name, command.args));
    }
    return stream.pipe(ezs(command.name, command.args));
};

export const foo = 'bar';
