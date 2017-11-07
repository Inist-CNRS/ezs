const OBJ = require('dot-prop');

module.exports = function prepare(data, feed) {
  const PATH = this.getParam('path', 'ISTEX');
  const genre2host = this.getParam('genre2host', {
    journal: 'journal',
    'book-series': 'series',
    book: 'book',
    'reference-works': 'manual',
  });

  if (this.isLast()) {
    feed.close();
    return;
  }

  const genre = data[`${PATH}/host/genre/0`];
  const title = data[`${PATH}/host/title`];
  if (genre && title && genre2host[genre]) {
    OBJ.set(data, `${PATH}/host/${genre2host[genre]}/title`, title);
  }

  feed.write(data);
  feed.end();
};
