import { parse } from 'querystring';
import Expression from './expression';
import { M_NORMAL, M_ALL } from './constants';

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

export const parseCommand = (cmdline) => {
    if (!cmdline) {
        return cmdline;
    }
    const matches1 = cmdline.match(/([:\w]+)\?(.*)/);
    let args = {};
    let mode = M_NORMAL;
    let name = 'debug';
    let use = '';
    const test = '';
    if (Array.isArray(matches1)) {
        let qstr;
        [, name, qstr] = matches1;
        args = { ...parse(qstr) };
        mode = M_ALL.reduce((prev, cur) => ((args[cur] !== undefined) ? cur : prev), M_NORMAL);
    } else {
        mode = M_NORMAL;
        name = cmdline;
    }
    if (name.indexOf(':') !== -1) {
        [use, name] = name.split(':');
    }
    return {
        mode,
        name,
        test,
        args,
        use,
    };
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
                const matches = line.match(regex.section);
                result.push(parseCommand(matches[1]));
            }
        }
    });
    const cmd = result.map((command) => ({
        ...command,
        args: parseOpts(command.args),
    }));
    return cmd;
}
