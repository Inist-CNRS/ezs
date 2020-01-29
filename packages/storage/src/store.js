import path from 'path';
import cacache from 'cacache';
import { tmpdir } from 'os';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import mm from 'micromatch';
import { promises as fsp } from 'fs';

const EZS_STORAGE_PATH = process.env.EZS_STORAGE_PATH || tmpdir();
const encodeKey = (k) => k;
const encodeValue = (v) => JSON.stringify(v);
const decodeValue = (v) => JSON.parse(String(v));

function readContent(data, feed) {
    if (this.isLast()) {
        feed.close(); return;
    }
    fsp.readFile(data.path)
        .then((content) => feed.send(decodeValue(content)))
        .catch((e) => feed.stop(e));
}

export const domainList = () => fsp.readdir(EZS_STORAGE_PATH).then(
    (files) => files.filter((file) => (file.indexOf('store_') === 0)).map((file) => file.substring(6)),
);
export async function domainCheck(domain) {
    const existingdomains = await domainList();
    const domains = Array.isArray(domain) ? [domain] : domain;

    const matches = mm(existingdomains, domains);
    if (matches.length === 0 && domain.match(/\w+/)) {
        return [domain];
    }
    return matches;
}

export class Store {
    constructor(ezs, domain) {
        this.domain = domain;
        this.ezs = ezs;
    }

    get(key) {
        return cacache.get(this.domain, encodeKey(key)).then(({ data }) => Promise.resolve(decodeValue(data)));
    }

    set(key, value) {
        return cacache.put(this.domain,
            encodeKey(key),
            encodeValue(value));
    }

    all(length) {
        const { ezs, domain } = this;
        return cacache.ls.stream(domain)
            .pipe(ezs(readContent))
            .pipe(ezs('truncate', { length }));
    }

    reset() {
        return cacache.rm.all(this.domain);
    }
}

const handle = {};
export default async function factory(ezs, domain) {
    if (!domain) {
        return Promise.reject(new Error('Invalid domain: undefined'));
    }
    const fullpath = path.resolve(EZS_STORAGE_PATH, `store_${domain}`);
    const check = await pathExists(fullpath);

    if (!handle[fullpath] || check !== true) {
        await makeDir(fullpath);
        handle[fullpath] = new Store(ezs, fullpath);
    }
    return Promise.resolve(handle[fullpath]);
}
