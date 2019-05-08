import Expression from './expression';
import { M_NORMAL } from './constants';

const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([\w.\-_]+)\s*[=: ]\s*(.*?)\s*$/,
    comment: /^\s*[;#].*$/,
};

const parseOpts = (obj) => {
    const res = {};
    Object.keys(obj).forEach((key) => {
        const val = obj[key].length === 1 ? obj[key][0] : obj[key];
        res[key] = new Expression(val);
    });
    return res;
};

export default function Script(commands) {
    if (!commands) {
        return [];
    }
    const lines = commands.split(/\r\n|\r|\n/);
    const result = [];
    lines.forEach((line) => {
        if (!regex.comment.test(line)) {
            if (regex.param.test(line)) {
                const match = line.match(regex.param);
                const paramName = match[1];
                const paramValue = match[2];
                const section = result.length > 0 ? result[result.length - 1] : null;
                if (section) {
                    if (!section.args[paramName]) {
                        result[result.length - 1].args[paramName] = [];
                    }
                    result[result.length - 1].args[paramName].push(paramValue);
                }
            } else if (regex.section.test(line)) {
                const matches0 = line.match(regex.section);
                const matches1 = matches0[1].match(/(\w+)\?(\w+)/);
                let mode = M_NORMAL;
                let name = 'debug';
                const test = '';
                if (Array.isArray(matches1)) {
                    [, name, mode] = matches1;
                } else {
                    mode = M_NORMAL;
                    [, name] = matches0;
                }
                const newSection = {
                    mode,
                    name,
                    test,
                    args: {},
                };
                result.push(newSection);
            }
        }
    });
    const cmd = result.map(command => ({
        ...command,
        args: parseOpts(command.args),
    }));
    return cmd;
}
