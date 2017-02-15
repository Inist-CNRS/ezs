module.exports =  {
  bufferify: require('./lib/bufferify.js'),
  stringify: require('./lib/stringify.js'),
  jsonify: require('./lib/jsonify.js'),
  split: require('./lib/segmenter.js'),
  segmenter: require('./lib/segmenter.js'),
  TXTParse: require('./lib/segmenter.js'),
  XMLParse: require('./lib/xml-parse.js'),
  CSVParse: require('./lib/csv-parse.js'),
  CSVObject: require('./lib/csv-object.js'),
  CSVString: require('./lib/csv-string.js'),
  JBJInject: require('./lib/jbj-inject.js'),
  JBJRender: require('./lib/jbj-render.js')
}
