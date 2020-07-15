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
    test('from file', (done) => {
        const output = [];
        const input = path.resolve(__dirname, './data-sample.skos');
        createReadStream(input)
            .pipe(ezs('concat'))
            .pipe(ezs('XMLParse', { separator: ' /rdf:RDF/skos:Concept' }))
            .pipe(ezs('SKOSObject'))
            .pipe(ezs('SKOSPathEnum', { language: 'fr' }))
            .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output[1].broader).toEqual(expect.arrayContaining('Plats à base de pomme de terre'));
                expect(output[2].broader).toEqual(expect.arrayContaining('Plats à base de pomme de terre'));
                done();
            });
    });
});
