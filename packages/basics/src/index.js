import BUFObject from './buf-object';
import OBJCount from './obj-count';
import OBJNamespaces from './obj-namespaces';
import OBJStandardize from './obj-standardize';
import OBJFlatten from './obj-flatten';
import BIBParse from './bib-parse';
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
import URLRequest from './url-request';
import URLPagination from './url-pagination';
import URLString from './url-string';
import URLStream from './url-stream';
import URLConnect from './url-connect';
import TXTZip from './txt-zip';
import ZIPExtract from './zip-extract';
import TARExtract from './tar-extract';
import TARDump from './tar-dump';
import INIString from './ini-string';
import FILESave from './file-save';
import FILELoad from './file-load';
import FILEMerge from './file-merge';

const funcs = {
    BUFObject,
    OBJCount,
    OBJNamespaces,
    OBJStandardize,
    OBJFlatten,
    BIBParse,
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
    URLRequest,
    URLParse,
    URLString,
    URLStream,
    URLConnect,
    TXTZip,
    ZIPExtract,
    TARExtract,
    TARDump,
    INIString,
    FILESave,
    FILELoad,
    FILEMerge,
    // aliases
    bufferify: BUFObject.BUFObject,
    concat: TXTConcat.TXTConcat,
    standardize: OBJStandardize.OBJStandardize,
    split: TXTParse.TXTParse,
    segmenter: TXTParse.TXTParse,
};

export default funcs;

module.exports = funcs;
