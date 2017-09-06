import filtrex from 'filtrex';

const fix = (input, ...args) => {
    if (args.length === 1) {
        return args[0];
    }
    return args;
};

const compute = (input, expr) => filtrex(expr)(input);

const self = input => input;

export default {
    fix,
    compute,
    self,
};
