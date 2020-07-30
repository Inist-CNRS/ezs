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
                expect(output[0].broader).toEqual(expect.arrayContaining([{ key: 'http://example.com/dishes#potatoBased', label: 'Plats à base de pomme de terre' }]));
                expect(output[1].broader).toEqual(expect.arrayContaining([{ key: 'http://example.com/dishes#potatoBased', label: 'Plats à base de pomme de terre' }]));
                expect(output[2].narrower).toEqual(expect.arrayContaining([
                    { key: 'http://example.com/dishes#fries', label: 'Frites' },
                    {
                        key: 'http://example.com/dishes#mashed',
                        label: 'Purée de pomme de terre'
                    }
                ]));
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
                expect(output[10]['prefLabel@fr']).toEqual('cobalt');
                expect(output[10].broader).toEqual(expect.arrayContaining([
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-NM5G007X-D',
                        label: 'métal de transition'
                    }
                ]));
                expect(output[10].broader).toEqual(expect.arrayContaining([
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-NM5G007X-D',
                        label: 'métal de transition'
                    },
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-ZR503FCG-D',
                        label: 'élément du bloc d'
                    },
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-WGZD8DMF-Z',
                        label: 'élément de la période 4'
                    },
                    {
                        key: 'http://data.loterre.fr/ark:/67375/8HQ-VVBTC56K-P',
                        label: 'élément du groupe 9'
                    }
                ]));
                done();
            });
    });

    /*
    test('from file : CHEBI.skos', (done) => {
        const output = [];
        const input = path.resolve('./packages/loterre/src/data/CHEBI.skos');
        createReadStream(input)
            .pipe(ezs('concat'))
            .pipe(ezs('XMLParse', { separator: ' /rdf:RDF/skos:Concept' }))
            .pipe(ezs('SKOSObject'))
            .pipe(ezs('SKOSPathEnum', { language: 'fr' }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toBe(125748);
                done();
            });
    });
    */
});
