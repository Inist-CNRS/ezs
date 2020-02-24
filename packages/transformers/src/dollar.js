import _ from 'lodash';

export default async function dollar(statement, data, feed, transformer) {
    if (statement.isLast()) {
        return feed.close();
    }
    const paths = statement.getParam('path');
    const path = Array.isArray(paths) ? paths.shift() : paths;
    const { args } = transformer.getMetas();

    const values = args.map((arg) => ({ ...arg, value: statement.getParam(arg.name) }));
    let newData;
    if (data.$origin) {
        newData = { ...data };
    } else {
        newData = {
            $origin: { ...data },
        };
    }
    const input = _.get(data, path, data);

    const output = await transformer(input, values)(input);

    _.set(newData, path, output);

    return feed.send(newData);
}
