const fix = (input, ...args) => {
    if (args.length === 1) {
        return args[0];
    }
    return args;
};

const prepend = (input, prefix = '') => String(prefix).concat(input);

const append = (input, suffix = '') => String(input).concat(suffix);

const self = (input) => input;

export default {
    fix,
    self,
    prepend,
    append,
};
