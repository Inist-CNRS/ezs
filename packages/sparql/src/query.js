export default function SPARQLQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    feed.write(data);
    feed.end();
} 
