'use strict';
function Concept(data, feed) {
  let obj = {};
  Object.keys(data).forEach(key => {
    let newkey = key.replace('skos$', '');
    if (Array.isArray(data[key])) {
      data[key].filter(x => x['xml$lang']).forEach(item => {
        obj[newkey + '@' + item['xml$lang']] = item['$t'];
      });
    }
    else if (data[key]['rdf$resource'] && !obj[newkey]) {
      obj[newkey] = data[key]['rdf$resource'];
    }
    else if (data[key]['rdf$resource'] && obj[newkey]) {
      obj[newkey] = [obj[newkey], data[key]['rdf$resource']];
    }
    else if (data[key]['$t'] && data[key]['xml$lang']) {
      obj[newkey + '@' + data[key]['xml$lang']] = data[key]['$t'];
    }
    else if (data[key]['$t'] && Array.isArray(obj[newkey])) {
      obj[newkey].push(data[key]['$t']);
    }
    else if (data[key]['$t'] && obj[newkey]) {
      obj[newkey] = [obj[newkey], data[key]['$t']];
    }
    else if (data[key]['$t'] && !obj[newkey]) {
      obj[newkey] = data[key]['$t'];
    }
    else if (typeof data[key] === 'object') {
      obj[newkey] = (this.getIndex().toString(36) + Math.random()
        .toString(36).substr(2, 5)).toUpperCase();
      let counter = 0;
      Object.keys(data[key]).forEach(key2=> {
        if (typeof data[key][key2] === 'object') {
          data[key][key2]['rdf$about'] = obj[newkey];
          Concept.call(this, data[key][key2], feed);
          counter++;
        }
      });
      if (counter === 0) {
        delete obj[newkey];
      }
    }
    else {
      obj[newkey] = data[key];
    }
  });
  feed.write(obj);
}

module.exports = function (data, feed) {
  if (this.isLast()) {
    feed.close();
  }
  else {
    Concept.call(this, data, feed);
    feed.end();
  }
};
