import OBJ from 'dot-prop';
import fetch from 'omni-fetch';
import { newValue } from './utils';

function ISTEXScroll(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const source = this.getParam('source');
    const target = this.getParam('target');
    const handle = source ? OBJ.get(data, source) : data;


    if (typeof handle !== 'string') {
        return feed.send(data);
    }
    fetch(handle)
        .then(response => response.json())
        .then((json) => {
            if (!json.total) {
                return feed.send(new Error('No result.'));
            }
            feed.write(newValue(json, target, data));
            return feed.end();
        }).catch((err) => {
            feed.send(err);
        });
}

export default {
    ISTEXScroll,
};
