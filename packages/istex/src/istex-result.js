import OBJ from 'dot-prop';
import { feedWrite } from './utils';

function ISTEXResult(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const source = this.getParam('source');
    const target = this.getParam('target');
    const handle = source ? OBJ.get(data, source) : data;

    const result = handle.hits || [];
    result.forEach((hitObj) => {
        feedWrite(feed, { ...hitObj }, target, data);
    });
    feed.end();
}

export default {
    ISTEXResult,
};
