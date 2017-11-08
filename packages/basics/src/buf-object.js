function BUFObject(data, feed) {
    if (this.isLast()) {
        feed.close();
    } else {
        feed.send(Buffer.from(data));
    }
}

export default {
    BUFObject,
};
