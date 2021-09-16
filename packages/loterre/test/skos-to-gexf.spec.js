import { createReadStream } from 'fs';
import path from 'path';
import ezs from '../../core/src';
import ezsBasics from '../../basics/src';
import ezsLocal from '../src';

ezs.use(ezsBasics);
ezs.use(ezsLocal);

describe('SKOSPathEnum', () => {
    beforeEach(() => {
        jest.setTimeout(500000);
    });

    test.skip('JSON file generator', (done) => {
        const output = [];
        const input = path.resolve('./packages/loterre/test/data/Tableau périodique des éléments.skos');
        const lang = 'fr';
        createReadStream(input)
            .pipe(ezs('concat'))
            .pipe(ezs('XMLParse', { separator: ' /rdf:RDF/skos:Concept' }))
            .pipe(ezs('SKOSObject'))
            .pipe(ezs('SKOSPathEnum', { path: ['narrower', 'broader'], label: 'prefLabel@fr' }))
            .pipe(ezs('SKOSToGexf', { path: ['narrower', 'broader'], label: 'prefLabel@fr' }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toEqual(1129);
            });
    });
});
