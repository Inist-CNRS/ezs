import { readFileSync } from 'fs';

export default function File(filename) {
    try {
        return readFileSync(filename, 'utf8');
    } catch (e) {
        throw e;
    }
}
