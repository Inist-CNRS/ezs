const assert = require('assert');

const { getSubject } = require('../lib/utils');

describe('utils', () => {
    describe('getSubject', () => {
        it('should parse URIs triple without carrier', () => {
            const subject = getSubject(
                '<subject> <verb> <complement> .',
            );
            assert.equal(subject, '<subject>');
        });

        it('should parse URIs triple with carrier', () => {
            const subject = getSubject(
                '<subject> <verb> <complement> .\n',
            );
            assert.equal(subject, '<subject>');
        });

        it('should parse triple with "a" without carrier', () => {
            const subject = getSubject(
                '<subject> a <type> .',
            );
            assert.equal(subject, '<subject>');
        });

        it('should parse triple with "a" with carrier', () => {
            const subject = getSubject(
                '<subject> a <type> .\n',
            );
            assert.equal(subject, '<subject>');
        });

        it('should parse triple with a litteral with carrier', () => {
            const subject = getSubject(
                '<subject> <verb> "complement" .\n',
            );
            assert.equal(subject, '<subject>');
        });

        it('should parse triple with a litteral without carrier', () => {
            const subject = getSubject(
                '<subject> <verb> "complement" .',
            );
            assert.equal(subject, '<subject>');
        });

        it('should parse literals containing >', () => {
            const subject = getSubject(
                '<subject> <verb> "comp > lement" .',
            );
            assert.equal(subject, '<subject>');
        });
    });
});
