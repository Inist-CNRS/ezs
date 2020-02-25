import _ from 'lodash';

export default async function dollar(statement, data, feed, transformer, doc) {
    if (statement.isLast()) {
        return feed.close();
    }
    const fields = statement.getParam('field');
    const field = Array.isArray(fields) ? fields.shift() : fields;
    const { args } = transformer.getMetas();
    let index = -1;
    const values = args.map((arg) => {
        const vals = statement.getParam(arg.name);
        if (Array.isArray(vals)) {
            index += 1;
            return {
                ...arg,
                value: vals[index],
            };
        }
        return {
            ...arg,
            value: vals,
        };
    });
    let newData;
    if (data.$origin) {
        newData = { ...data };
    } else {
        newData = {
            $origin: { ...data },
        };
    }
    const input = doc || _.get(data, field, null);

    const output = await transformer(input, values)(input);

    _.set(newData, field, output);

    return feed.send(newData);
}
