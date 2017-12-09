function ISTEXResult(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const result = data.hits || [];
    result.forEach((hitObj) => {
        feed.write({ ...hitObj });
    });
    feed.end();
}

export default {
    ISTEXResult,
};
