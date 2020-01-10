import levelup from 'levelup';
import leveldown from 'leveldown';
import { tmpdir } from 'os';
import { resolve } from 'path';


const handle = {};
export default function factory(location) {
    if (!location) {
        throw new Error('Invalid location: undefined');
    }
    const id = `repository_${location}`;
    if (!handle[id] || handle[id].isClosed()) {
        handle[id] = levelup(leveldown(resolve(tmpdir(), id)));
    }
    return handle[id];
}
