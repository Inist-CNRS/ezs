import { get as _get, flatten as _flatten } from 'lodash';
import { transformerWithArg } from './transformer';

export const get = (value, path) => {
    const keys = path.split(';');
    const values = _flatten(keys.map(key => _get(value, key, '')));
    return values.length === 1 ? values[0] : values;
};

const transformation = (_, args) => value =>
    transformerWithArg(get, 'path', value, args);

transformation.getMetas = () => ({
    name: 'GET',
    type: 'transform',
    args: [{ name: 'path', type: 'string' }],
});

export default transformation;
