/* eslint-disable max-len */
/* eslint-disable comma-dangle */
import { createReadStream } from 'fs';
import path from 'path';
// import debug from 'debug';
// debug.enable('ezs');
import ezs from '../../core/src';
import ezsBasics from '../../basics/src';
import ezsLocal from '.';

var jsonxml = require('jsontoxml');

const fs = require('fs');

ezs.use(ezsBasics);
ezs.use(ezsLocal);

describe('SKOSPathEnum', () => {
    beforeEach(() => {
        jest.setTimeout(500000);
    });

    test('JSON file generator', (done) => {
        const output = [];
        const input = path.resolve('./packages/loterre/src/data/Tableau périodique des éléments.skos');
        const lang = 'fr';
        createReadStream(input)
            .pipe(ezs('concat'))
            .pipe(ezs('XMLParse', { separator: ' /rdf:RDF/skos:Concept' }))
            .pipe(ezs('SKOSObject'))
            .pipe(ezs('SKOSPathEnum', { language: lang }))
            .pipe(ezs('SKOSToGexf', { language: lang, addNodes: false }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                const nodesArr = output[output.length - 1].nodes;

                const edgesArr = [];
                for (let i = 0; i < output.length - 2; i++) {
                    edgesArr.push(output[i]);
                }

                const gexf = [{ name: 'gexf', children: [{ name: 'graph', children: [[{ name: 'nodes', children: nodesArr, attrs: { count: nodesArr.length } }], [{ name: 'edges', children: edgesArr, attrs: { count: edgesArr.length } }]], attrs: { mode: 'static', defaultedgetype: 'directed' } }] }];
                const jsonContent = jsonxml(gexf, { prettyPrint: true, xmlHeader: true });
                fs.writeFile('./packages/loterre/src/test/Tableau périodique des éléments.xml', jsonContent, 'utf8', (err) => {
                    if (err) {
                        return err;
                    }
                    console.log('JSON file has been saved.');
                    done();
                });
            });
    });
});
