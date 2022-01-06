import { parse, unescape } from 'querystring';
import autocast from 'autocast';
import Expression from './expression';

const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    nested: /(^[\w.*?~]+)\/([\w.*?~].*)/,
    param: /^\s*([\w.\-_]+)\s*[=: ]\s*(.*?)\s*$/,
    comment: /^\s*[;#].*$/,
};
const decodeURIComponent = (s) => autocast(unescape(s));
const parseOpts = (obj) => {
    const res = {};
    Object.keys(obj).forEach((key) => {
        const val = obj[key].length === 1 ? obj[key][0] : obj[key];
        res[key] = new Expression(val);
    });
    return res;
};

export const parseCommand = (cmdline) => {
    if (!cmdline || typeof cmdline !== 'string') {
        return false;
    }
    const matches1 = cmdline.match(/([:\w]+)\?(.*)/);
    let args = {};
    let mode = null;
    let name = 'debug';
    let use = '';
    const test = '';
    if (Array.isArray(matches1)) {
        let qstr;
        [, name, qstr] = matches1;
        args = {
            ...parse(qstr, null, null, { decodeURIComponent }),
        };
        mode = qstr;
    } else {
        mode = null;
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
function flat(cmd) {
    const gcmd = cmd.reduce((prev, cur) => {
        if (regex.nested.test(cur.name)) {
            const match = cur.name.match(regex.nested);
            const ncur = { ...cur, name: match[2] };
            const last = prev.pop();
            if (last.args.commands) {
                last.args.commands.push(ncur);
            } else {
                last.args.commands = [ncur];
            }
            return ([...prev, last]);
        }
        return ([...prev, cur]);
    }, []);
    if (cmd.length === gcmd.length) {
        return gcmd;
    }
    return flat(gcmd).map((item) => {
        if (item.args.commands) {
            item.args.commands = flat(item.args.commands);
        }
        return item;
    });
}

export default function Script(commands) {
    if (!commands) {
        return [];
    }
    const lines = commands.split('\\\n').join('').split(/\r\n|\r|\n/);
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

    return flat(cmd);
}
