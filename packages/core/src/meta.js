const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([\w.\-_]+)\s*[=: ]\s*(.*?)\s*$/,
    comment: /^\s*[;#].*$/,
};

export default function Meta(ezs, commands) {
    const lines = commands.split(/\r\n|\r|\n/);
    const result = {};
    let meta = true;
    lines.forEach((line) => {
        if (!regex.comment.test(line)) {
            if (regex.param.test(line) && meta) {
                const match = line.match(regex.param);
                const paramName = match[1];
                const paramValue = match[2];
                result[paramName] = paramValue;
            } else if (regex.section.test(line)) {
                meta = false;
            }
        }
    });
    return result;
}
