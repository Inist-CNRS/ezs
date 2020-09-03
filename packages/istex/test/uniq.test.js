import assert from 'assert';
import from from 'from';

import ezs from '../../core/src';

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

describe('ISTEXUniq', () => {
    it('should remove identical lines one after another', (done) => {
        let result = [];
        from([
            '<subject> <verb> <complement> .',
            '<subject> <verb> <complement> .',
        ])
            .pipe(ezs('ISTEXUniq'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert.equal(result[0], '<subject> <verb> <complement> .\n');
                done();
            });
    });

    it('should remove identical lines even if not following one another', (done) => {
        let result = [];
        from([
            '<subject> <verb> <complement> .',
            '<subject> <verb2> <complement2> .',
            '<subject> <verb> <complement> .',
        ])
            .pipe(ezs('ISTEXUniq'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert.equal(result[0],
                    '<subject> <verb> <complement> .\n');
                assert.equal(result[1],
                    '<subject> <verb2> <complement2> .\n');
                done();
            });
    });

    it('should remove identical lines in two different subjects', (done) => {
        let result = [];
        from([
            '<subject1> <verb> <complement> .',
            '<subject1> <verb2> <complement2> .',
            '<subject1> <verb> <complement> .',
            '<subject2> <verb> <complement> .',
            '<subject2> <verb2> <complement2> .',
            '<subject2> <verb> <complement> .',
        ])
            .pipe(ezs('ISTEXUniq'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 4);
                assert.equal(result[0], '<subject1> <verb> <complement> .\n');
                assert.equal(result[1], '<subject1> <verb2> <complement2> .\n');
                assert.equal(result[2], '<subject2> <verb> <complement> .\n');
                assert.equal(result[3], '<subject2> <verb2> <complement2> .\n');
                done();
            });
    });

    it('should remove identical lines in two different subjects when verbs are different', (done) => {
        let result = [];
        from([
            '<subject1> <verb> <complement> .',
            '<subject1> <verb2> <complement2> .',
            '<subject1> <verb> <complement> .',
            '<subject2> <verb2> <complement> .',
            '<subject2> <verb> <complement2> .',
            '<subject2> <verb2> <complement> .',
        ])
            .pipe(ezs('ISTEXUniq'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 4);
                assert.equal(result[0],
                    '<subject1> <verb> <complement> .\n');
                assert.equal(result[1],
                    '<subject1> <verb2> <complement2> .\n');
                assert.equal(result[2],
                    '<subject2> <verb2> <complement> .\n');
                assert.equal(result[3],
                    '<subject2> <verb> <complement2> .\n');
                done();
            });
    });

    it('should not mess up > character in literal', (done) => {
        let result = [];
        from([
            '<subject1> <verb> "Another Rigvedic Genitive Singular in -E > -AS?" .',
        ])
            .pipe(ezs('ISTEXUniq'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert.equal(result[0],
                    '<subject1> <verb> "Another Rigvedic Genitive Singular in -E > -AS?" .\n');
                done();
            });
    });

    it('should not mess up \\ character in literal', (done) => {
        let result = [];
        from([
            '<subject1> <verb> "Kroi\\" .',
        ])
            .pipe(ezs('ISTEXUniq'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert.equal(result[0],
                    '<subject1> <verb> "Kroi\\\\" .\n');
                done();
            });
    });
});
