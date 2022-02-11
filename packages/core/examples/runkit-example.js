const ezs = require('@ezs/core');
const from = require('from');

const script = `
[replace]
path = id
value = 1

path = value
value = This is a simple demo
`;

from([1])
    .pipe(ezs('delegate', { script }))
    .on('data', console.log)
    .on('end', () => {
        console.log('Stream\'s end.');
    });
