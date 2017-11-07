/* eslint global-require: "off"*/
module.exports = {
  ISTEXCorpus: require('./lib/corpus.js'),
  ISTEXQuery: require('./lib/query.js'),
  ISTEXHarvest: require('./lib/harvest.js'),
  ISTEXRequest: require('./lib/request.js'),
  ISTEXHits: require('./lib/hits.js'),
  ISTEXMods: require('./lib/mods.js'),
  ISTEXParseXML: require('./lib/parse-xml.js'),
  ISTEXPrepare: require('./lib/prepare.js'),
  ISTEXScroll: require('./lib/scroll.js'),
  ISTEXTriplify: require('./lib/triplify.js'),
  ISTEXFulltext: require('./lib/get-fulltext.js'),
};
