const OBJ = require('dot-prop');
const clone = require('clone');
const XMLMapping = require('xml-mapping');

module.exports = function ISTEXParseXML(data, feed) {
  const path = this.getParam('path', 'ISTEX');
  let handle = OBJ.get(data, path);
  if (handle === undefined) {
    handle = data;
  }

  if (this.isLast()) {
    feed.close();
  } else {
    const jsObj = XMLMapping.load(handle);
    if (handle === undefined) {
      feed.send(jsObj);
    } else {
      const out = clone(data);
      OBJ.set(out, path, jsObj);
      feed.send(out);
    }
  }
};
