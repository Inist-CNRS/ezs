/*
import fetch from 'fetch-with-proxy';
import MultiStream from 'multistream';
import { DEBUG } from '../constants';
export default function harvest(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return new Promise(resolve => resolve(!Array.isArray(data) ? [data] : data))
        .then(urls => Promise.resolve(urls.map(url => fetch(url))))
        .then(strms => Promise.all(strms))
        .then(responses => Promise.resolve(responses.filter(r => r.ok).map(r => r.body)))
        .then(streams => Promise.resolve(new MultiStream(streams)))
        .then(stream => new Promise(resolve => stream
            .on('error', e => feed.write(e))
            .on('data', d => feed.write(d))
            .on('end', () => feed.end())
            .on('close', () => resolve(true))))
        .catch((error) => {
            DEBUG('The server has detected an error while gathering streams', error);
        });
}
*/
