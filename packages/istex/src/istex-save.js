import URL from 'url';
import path from 'path';
import fetch from 'omni-fetch';
import fs from 'fs';
import os from 'os';
import queue from 'async.queue';
import isStream from 'is-stream';
import writeFile from 'write';
import InistARK from 'inist-ark';
 
const ark = new InistARK();
const worker = (options) => ({ source, target }, done) => fetch(source, options)
    .then(response => {
        if (!isStream(response.body)) {
            return done(new Error('Unexpected response'));
        }
        response.body
            .pipe(writeFile.stream(target))
            .on('end', (err) => done(err))
            .on('close', () => done(target));
    });

function ISTEXSave(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const directory = this.getParam('directory',  process.cwd());
    const typology = this.getParam('typology', 'fulltext');
    const format = this.getParam('format', 'pdf');
    const sid = this.getParam('sid', 'ezs-istex');
    const token = this.getParam('token');
    const headers = {};
    const location = {
        protocol: 'https:',
        host: 'api.istex.fr',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (!data.hits && !data.arkIstex) {
        throw new Error('[ISTEXFetch] or [ISTEXSearch] should be defined before this statement.');
    }
    if (!format && !typology) {
        throw new Error('typology= & format= must be defined as parameter.');
    }

    const identifiers = data.hits ? data.hits.map(hit => hit.arkIstex) : [data.arkIstex];
    const files = identifiers.map((arkIstex) => {
        const { name:arkName } = ark.parse(arkIstex);
        const pathname = `${arkIstex}/${typology}.${format}`;
        const filename = `${arkName}-${typology}.${format}`;
        const urlObj = {
            ...location,
            pathname,
            query: {
                sid,
            },
        }
        const cmdObj = {
            source: URL.format(urlObj),
            target: path.resolve(directory, filename),
        };
        return cmdObj;

    });
    const o = {
        headers,
        sid,
    };
    const q = queue(worker(o), os.cpus().length);
    q.drain = () => feed.end();
    files.forEach(file => q.push(file, (filename) => feed.write(filename)));
}

export default {
    ISTEXSave,
};
