import BUFObject from './buf-object';
import OBJCount from './obj-count';
import OBJStandardize from './obj-standardize';
import OBJFlatten from './obj-flatten';
import TXTConcat from './txt-concat';
import TXTObject from './txt-object';
import TXTParse from './txt-parse';
import XMLParse from './xml-parse';
import XMLString from './xml-string';
import CSVParse from './csv-parse';
import CSVObject from './csv-object';
import CSVString from './csv-string';
import SKOSObject from './skos-object';
import JSONParse from './json-parse';
import JSONString from './json-string';
import URLFetch from './url-fetch';
import URLParse from './url-parse';
import URLString from './url-string';
import URLStream from './url-stream';
import TXTZip from './txt-zip';

export default {
    BUFObject,
    OBJCount,
    OBJStandardize,
    OBJFlatten,
    TXTParse,
    TXTObject,
    TXTConcat,
    XMLParse,
    XMLString,
    CSVParse,
    CSVObject,
    CSVString,
    SKOSObject,
    JSONParse,
    JSONString,
    URLFetch,
    URLParse,
    URLString,
    URLStream,
    TXTZip,
    // aliases
    bufferify: BUFObject.BUFObject,
    jsonify: JSONString.JSONString,
    flatten: OBJFlatten.OBJFlatten,
    concat: TXTConcat.TXTConcat,
    standardize: OBJStandardize.OBJStandardize,
    split: TXTParse.TXTParse,
    segmenter: TXTParse.TXTParse,
};
