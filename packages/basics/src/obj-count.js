function OBJCount(data, feed) {
    if (this.isLast()) {
        feed.send(this.getIndex());
    } else {
        feed.end();
    }
}

export default {
    OBJCount,
};
