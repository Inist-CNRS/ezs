import JSONezs from '../json';

export default function jsonezs(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    return feed.send(JSONezs.parse(data));
}
