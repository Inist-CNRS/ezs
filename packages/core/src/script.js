const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([\w.\-_]+)\s*[=: ]\s*(.*?)\s*$/,
    comment: /^\s*[;#].*$/,
};

const parseArgs = (obj) => {
    const res = {};
    if (typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
            const val = obj[key].length === 1 ? obj[key][0] : obj[key];
            res[key] = parser => parser(val);
        });
    }
    return res;
};

export default function Script(commands) {
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
                const match = line.match(regex.section);
                const sectionName = match[1];
                const newSection = {
                    name: sectionName,
                    args: {},
                };
                result.push(newSection);
            }
        }
    });
    const cmd = result.map(com => ({
        name: com.name,
        args: parseArgs(com.args),
    }));
    return cmd;
}
