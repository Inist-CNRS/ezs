import { readFileSync } from 'fs';
import { dirname } from 'path';

export default function File(ezs, filename) {
    try {
        ezs.addPath(dirname(filename));
        return readFileSync(filename, 'utf8');
    } catch (e) {
        throw e;
    }
}
