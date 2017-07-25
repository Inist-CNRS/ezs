import filtrex from 'filtrex';

const fix = (input, ...args) => {
    if (args.length === 1) {
        return args[0];
    }
    return args;
};

const compute = (input, expr) => filtrex(expr)(input);

export default {
    fix,
    compute,
};
