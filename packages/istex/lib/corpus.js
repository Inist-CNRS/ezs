const clone = require('clone');

module.exports = function ISTEXCorpus(data, feed) {
  if (this.isLast()) {
    return feed.close();
  }
  const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([\w.\-_]+)\s+(.*?)\s*$/,
    comment: /^\s*[;#].*$/,
  };
  const value = {};
  const lines = data.split(/\r\n|\r|\n/);
  let section = null;
  lines.forEach((line) => {
    if (!regex.comment.test(line)) {
      if (regex.param.test(line)) {
        const match = line.match(regex.param);
        if (section && value[section][match[1]] === undefined) {
          value[section][match[1]] = [match[2]];
        } else if (section && value[section][match[1]]) {
          value[section][match[1]] = value[section][match[1]].concat(match[2]);
        } else {
          value[match[1]] = match[2];
        }
      } else if (regex.section.test(line)) {
        const match = line.match(regex.section);
        value[match[1]] = {};
        section = match[1];
      }
    }
  });


  const shared = {};
  Object.keys(value)
    .filter(key => typeof value[key] !== 'object')
    .forEach((key) => {
      shared[key] = value[key];
    });

  const istex = Object.keys(value)
    .filter(key => typeof value[key] === 'object' && key.toUpperCase() === 'ISTEX')
    .map(key => value[key])
    .pop();

  if (istex && istex.query) {
    istex.query.forEach((q) => {
      const obj = clone(shared);
      obj.ISTEX = {
        q,
        sortBy: 'host.doi',
      };
      feed.write(obj);
    });
  }
  feed.end();
};

