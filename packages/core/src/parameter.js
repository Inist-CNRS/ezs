import Statement from './statement';
import JSONezs from './json';

function encode(string) {
    return Buffer.from(string).toString('base64');
}

function decode(string) {
    return Buffer.from(string, 'base64').toString();
}

function pack(data) {
    return encode(JSON.stringify(data));
}

function unpack(data) {
    return JSON.parse(decode(data));
}

function unscramble(data) {
    return JSONezs.parse(decode(data));
}

export default {
    pack,
    unpack,
    encode,
    decode,
    unscramble,
};
