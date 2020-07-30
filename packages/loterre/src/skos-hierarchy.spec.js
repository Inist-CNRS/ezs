/* eslint-disable prefer-arrow-callback */
/* eslint-disable max-len */
/* eslint-disable comma-dangle */
import { createReadStream } from 'fs';
import path from 'path';
// import debug from 'debug';
// debug.enable('ezs');
import ezs from '../../core/src';
import ezsBasics from '../../basics/src';
import ezsLocal from '.';

ezs.use(ezsBasics);
ezs.use(ezsLocal);

describe('SKOSPathEnum', () => {
    beforeEach(() => {
        jest.setTimeout(10000);
    });

    test('from file : data-sample.skos', (done) => {
        const output = [];
        const input = path.resolve('./packages/loterre/src/data/data-sample.skos');
        const lang = 'fr';
        createReadStream(input)
            .pipe(ezs('concat'))
            .pipe(ezs('XMLParse', { separator: ' /rdf:RDF/skos:Concept' }))
            .pipe(ezs('SKOSObject'))
            .pipe(ezs('SKOSPathEnum', { language: lang }))
            .pipe(ezs('SKOSHierarchy', { language: lang, addNodes: false }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toBe(4);
                expect(output[0].source).toEqual('Frites');
                expect(output[0].target).toEqual('Plats à base de pomme de terre');
                done();
            });
    });

    test('from file : Tableau périodique des éléments.skos', (done) => {
        const output = [];
        const input = path.resolve('./packages/loterre/src/data/Tableau périodique des éléments.skos');
        createReadStream(input)
            .pipe(ezs('concat'))
            .pipe(ezs('XMLParse', { separator: ' /rdf:RDF/skos:Concept' }))
            .pipe(ezs('SKOSObject'))
            .pipe(ezs('SKOSPathEnum', { language: 'fr' }))
            .pipe(ezs('SKOSHierarchy', { language: 'fr' }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toBe(1128);
                expect(output[0].source).toEqual('tungstène');
                expect(output[0].target).toEqual('métal de transition');
                done();
            });
    });
});
