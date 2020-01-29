import nolookalikes from 'nanoid-dictionary/nolookalikes';

const schemes = ['ark', 'uid'];
const match = {
    uid: (i) => i.match(/uid:\/(.{3})-(.{8})-(.{1})/),
    ark: (i) => i.match(/ark:\/.{5}\/(.{3})-(.{8})-(.{1})/),
};

//
// JS implentation of NCDA
// see http://search.cpan.org/~jak/Noid/noid#NOID_CHECK_DIGIT_ALGORITHM
//
export function ncda(input, alphabet = []) {
    if (!input || typeof input !== 'string') {
        return '';
    }
    const R = alphabet.length;
    const chr = input.split('');
    const ord = [];
    const pos = [];
    chr.forEach((c, i) => {
        const z = alphabet.indexOf(c);
        ord.push(z > 0 ? z : 0);
        pos.push(i + 1);
    });
    let sum = 0;
    pos.forEach((p, i) => {
        sum += p * ord[i];
    });
    const x = sum % R;
    return alphabet[x] || '';
}
export const checkdigit = (input) => ncda(input, nolookalikes);

export function isURI(input) {
    const uri = String(input);
    const scheme = uri.substr(0, uri.indexOf(':'));
    const slash = (uri.indexOf('/') !== -1);
    const allowedScheme = (schemes.indexOf(scheme) !== -1);
    return (allowedScheme && slash);
}

export function parseURI(input) {
    const uri = String(input);
    const scheme = uri.substr(0, uri.indexOf(':'));
    if (!match[scheme]) {
        throw new Error(`Parse URI failed. Unknown scheme (${scheme})`);
    }
    const parsedURI = match[scheme](input);
    if (!parsedURI) {
        throw new Error(`Parse URI failed. Invalid syntax for scheme (${input})`);
    }
    const [, domain, identifier, checksum] = parsedURI;
    const check = checkdigit(domain + identifier);

    if (check !== checksum) {
        throw new Error(`Parse URI failed. Invalid checksum (${checksum})`);
    }
    return {
        scheme,
        domain,
        identifier,
        checksum,
    };
}
