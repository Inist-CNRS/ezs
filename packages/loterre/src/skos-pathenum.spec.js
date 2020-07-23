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
        jest.setTimeout(500000);
    });
    test('from large file : CHEBI.skos', (done) => {
        const output = [];
        const input = path.resolve('./packages/loterre/src/data/CHEBI.skos');
        createReadStream(input)
            .pipe(ezs('concat'))
            .pipe(ezs('XMLParse', { separator: ' /rdf:RDF/skos:Concept' }))
            .pipe(ezs('SKOSObject'))
            .pipe(ezs('SKOSPathEnum', { language: 'en' }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toBe(125748);
                done();
            });
    });

    test('from file : data-sample.skos', (done) => {
        const output = [];
        const input = path.resolve('./packages/loterre/src/data/data-sample.skos');
        createReadStream(input)
            .pipe(ezs('concat'))
            .pipe(ezs('XMLParse', { separator: ' /rdf:RDF/skos:Concept' }))
            .pipe(ezs('SKOSObject'))
            .pipe(ezs('SKOSPathEnum', { language: 'fr' }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output[1].broader).toEqual(expect.arrayContaining([{ key: 'http://example.com/dishes#potatoBased', label: 'Plats à base de pomme de terre' }]));
                expect(output[2].broader).toEqual(expect.arrayContaining([{ key: 'http://example.com/dishes#potatoBased', label: 'Plats à base de pomme de terre' }]));
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
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toBe(171);
                expect(output[100]['prefLabel@fr']).toEqual('platinoïde');
                expect(output[100].broader).toEqual(expect.arrayContaining([
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-NM5G007X-D',
                        label: 'métal de transition'
                    }
                ]));
                expect(output[100].narrower).toEqual(expect.arrayContaining([
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-R6LMKQKX-5',
                        label: 'ruthénium'
                    },
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-FKKNQWB0-B',
                        label: 'rhodium'
                    },
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-GKH9PL2W-2',
                        label: 'palladium'
                    },
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-V9RXLN1J-0',
                        label: 'osmium'
                    },
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-WK9PDRSF-D',
                        label: 'iridium'
                    },
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-HCSZZCGN-4',
                        label: 'platine'
                    }
                ]));
                done();
            });
    });
});
