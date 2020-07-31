import from from 'from';
// import debug from 'debug';
// debug.enable('ezs');
import ezs from '../../core/src';
import ezsBasics from '../../basics/src';
import ezsLocal from '../src';

ezs.use(ezsBasics);
ezs.use(ezsLocal);

describe('SKOSObject', () => {
    test('from xml', (done) => {
        const output = [];
        const input = `
<rdf:RDF
xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
xmlns:skos="http://www.w3.org/2004/02/skos/core#">
<skos:Concept rdf:about="http:/example.com/Concept/0001">
<skos:prefLabel xml:lang="fr">Frites</skos:prefLabel>
<skos:altLabel xml:lang="fr">Pommes de terre frites</skos:altLabel>
<skos:altLabel xml:lang="fr">Pommes frites</skos:altLabel>
<skos:prefLabel xml:lang="en">Chips</skos:prefLabel>
<skos:altLabel xml:lang="en">French fries</skos:altLabel>
<skos:inScheme rdf:resource="http:/example.com/thesaurus"/>
</skos:Concept>
</rdf:RDF>
`;
        from([input])
            .pipe(ezs('concat'))
            .pipe(ezs('XMLParse', { separator: ' /rdf:RDF/skos:Concept' }))
            .pipe(ezs('SKOSObject'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0]['altLabel@en']).toStrictEqual('French fries');
                expect(output[0]['altLabel@fr']).toStrictEqual('Pommes frites');
                done();
            });
    });
});
