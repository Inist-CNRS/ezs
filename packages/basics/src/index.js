import BUFObject from './buf-object';
import OBJCount from './obj-count';
import OBJStandardize from './obj-standardize';
import OBJFlatten from './obj-flatten';
import TXTConcat from './txt-concat';
import TXTObject from './txt-object';
import TXTParse from './txt-parse';
import XMLParse from './xml-parse';
import CSVParse from './csv-parse';
import CSVObject from './csv-object';
import CSVString from './csv-string';
import SKOSObject from './skos-object';
import JSONParse from './json-parse';
import JSONString from './json-string';
import URLFetch from './url-fetch';

export default {
    BUFObject,
    OBJCount,
    OBJStandardize,
    OBJFlatten,
    TXTParse,
    TXTObject,
    TXTConcat,
    XMLParse,
    CSVParse,
    CSVObject,
    CSVString,
    SKOSObject,
    JSONParse,
    JSONString,
    URLFetch,
    // aliases
    bufferify: BUFObject.BUFObject,
    jsonify: JSONString.JSONString,
    flatten: OBJFlatten.OBJFlatten,
    concat: TXTConcat.TXTConcat,
    standardize: OBJStandardize.OBJStandardize,
    split: TXTParse.TXTParse,
    segmenter: TXTParse.TXTParse,
};
