import flattenPatch from './flatten-patch';
import objects2columns from './objects2columns';
import convertJsonLdToNQuads from './convertJsonLdToNQuads';
import convertToAtom from './convertToAtom';
import convertToExtendedJsonLd from './convertToExtendedJsonLd';
import convertToJson from './convertToJson';
import convertToSitemap from './convertToSitemap';
import extractIstexQuery from './extractIstexQuery';
import filterContributions from './filterContributions';
import filterVersions from './filterVersions';
import linkDataset from './linkDataset';
import useFieldNames from './useFieldNames';
import JSONLDCompacter from './JSONLDCompacter';
import JSONLDString from './JSONLDString';
import JSONLDObject from './JSONLDObject';
import disabled from './disabled';
import runQuery from './runQuery';
import reduceQuery from './reduceQuery';
import formatOutput from './formatOutput';
import getLastCharacteristic from './getLastCharacteristic';

export default {
    flattenPatch,
    objects2columns,
    convertJsonLdToNQuads,
    convertToAtom,
    convertToExtendedJsonLd,
    convertToJson,
    convertToSitemap,
    extractIstexQuery,
    filterContributions,
    filterVersions,
    getLastCharacteristic,
    linkDataset,
    useFieldNames,
    JSONLDCompacter,
    JSONLDString,
    JSONLDObject,
    runQuery,
    reduceQuery,
    formatOutput,
    // aliases
    fixFlatten: flattenPatch.flattenPatch,
    LodexContext: disabled.disabled,
    LodexConfig: disabled.disabled,
    LodexParseQuery: disabled.disabled,
    LodexSetField: disabled.disabled,
    LodexDocuments: runQuery.runQuery,
    LodexRunQuery: runQuery.runQuery,
    LodexReduceQuery: reduceQuery.reduceQuery,
    LodexOutput: formatOutput.formatOutput,
};
