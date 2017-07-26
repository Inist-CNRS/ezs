function JSONString(data, feed) {
    const indent = this.getParam('indent', false);
    let output = '';
    if (this.isFirst()) {
        output = '[';
    } else {
        output = ',\n';
    }
    if (!this.isLast()) {
        feed.write(output.concat(JSON.stringify(data, null, indent ? '    ' : null)));
    } else {
        feed.write(']');
        feed.close();
    }
    feed.end();
}

export default {
    JSONString,
};
