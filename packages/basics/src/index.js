import BUFObject from './buf-object';
import OBJCount from './obj-count';
import OBJNamespaces from './obj-namespaces';
import OBJStandardize from './obj-standardize';
import OBJFlatten from './obj-flatten';
import TXTConcat from './txt-concat';
import TXTObject from './txt-object';
import TXTParse from './txt-parse';
import XMLParse from './xml-parse';
import XMLString from './xml-string';
import XMLConvert from './xml-convert';
import CSVParse from './csv-parse';
import CSVObject from './csv-object';
import CSVString from './csv-string';
import JSONParse from './json-parse';
import JSONString from './json-string';
import URLFetch from './url-fetch';
import URLParse from './url-parse';
import URLPagination from './url-pagination';
import URLString from './url-string';
import URLStream from './url-stream';
import URLConnect from './url-connect';
import TXTZip from './txt-zip';
import ZIPExtract from './zip-extract';
import INIString from './ini-string';
import FILESave from './file-save';

const funcs = {
    BUFObject,
    OBJCount,
    OBJNamespaces,
    OBJStandardize,
    OBJFlatten,
    TXTParse,
    TXTObject,
    TXTConcat,
    XMLParse,
    XMLString,
    XMLConvert,
    CSVParse,
    CSVObject,
    CSVString,
    JSONParse,
    JSONString,
    URLFetch,
    URLPagination,
    URLParse,
    URLString,
    URLStream,
    URLConnect,
    TXTZip,
    ZIPExtract,
    INIString,
    FILESave,
    // aliases
    bufferify: BUFObject.BUFObject,
    concat: TXTConcat.TXTConcat,
    standardize: OBJStandardize.OBJStandardize,
    split: TXTParse.TXTParse,
    segmenter: TXTParse.TXTParse,
};

export default funcs;

module.exports = funcs;
