import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import basicsStatements from '../../basics/src';
import statements from '../src';

ezs.use(basicsStatements);
ezs.use(statements);

describe('teeft fr', () => {
    it('should work on a single file', (done) => {
        let res = [];
        // from([`${__dirname}/../examples/data/artificial.txt`])
        from([`${__dirname}/../examples/data/fr-articles/docnum1_2013.txt`])
            .pipe(ezs('TeeftGetFilesContent'))
            .pipe(ezs('TeeftToLowerCase', { path: ['content'] }))
            .pipe(ezs('TeeftSentenceTokenize'))
            .pipe(ezs('TeeftTokenize'))
            .pipe(ezs('TeeftNaturalTag'))
            .pipe(ezs('TeeftExtractTerms', { nounTag: 'NOM', adjTag: 'ADJ' }))
            // .pipe(ezs('debug', { text: 'extract-terms'}))
            .pipe(ezs('TeeftFilterTags', { tags: ['NOM', 'ADJ', 'UNK'] }))
            // .pipe(ezs('debug', { text: 'filter-tags'}))
            .pipe(ezs('TeeftStopWords'))
            // .pipe(ezs('debug', { text: 'stop-words'}))
            .pipe(ezs('TeeftSumUpFrequencies'))
            // .pipe(ezs('debug', { text: 'sum-up-frequencies'}))
            .pipe(ezs('TeeftSpecificity', { sort: true }))
            // .pipe(ezs('debug', { text: 'specificity'}))
            .pipe(ezs('TeeftFilterMonoFreq'))
            // .pipe(ezs('debug', { text: 'filter-mono-freq'}))
            .pipe(ezs('TeeftFilterMultiSpec'))
            // .pipe(ezs('debug', { text: 'filter-multi-spec'}))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms.length).toBeGreaterThan(0);
                const categorisation = terms.find(term => term.term === 'catégorisation');
                expect(categorisation).toMatchObject({
                    frequency: 13,
                    length: 1,
                    tag: [ 'NOM' ],
                    term: 'catégorisation'
                });
                expect(categorisation.specificity).toBeCloseTo(0.8909066666666675, 10);
                const classifAuto = terms.find(term => term.term === 'classification automatique');
                expect(classifAuto).toMatchObject({
                    frequency: 5,
                    length: 2,
                    term: 'classification automatique'
                });
                expect(classifAuto.specificity).toBeCloseTo(0.06410256410256408, 10);
                done();
            });
    }, 6000);
});
