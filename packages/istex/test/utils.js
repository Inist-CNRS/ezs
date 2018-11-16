const assert = require('assert');

const { getTriple } = require('../lib/utils');

describe('utils', () => {
    describe('getTriple', () => {
        it('should parse URIs triple without carrier', () => {
            const [subject, verb, complement] = getTriple(
                '<subject> <verb> <complement> .',
            );
            assert.equal(subject, '<subject>');
            assert.equal(verb, '<verb>');
            assert.equal(complement, '<complement>');
        });

        it('should parse URIs triple with carrier', () => {
            const [subject, verb, complement] = getTriple(
                '<subject> <verb> <complement> .\n',
            );
            assert.equal(subject, '<subject>');
            assert.equal(verb, '<verb>');
            assert.equal(complement, '<complement>');
        });

        it('should parse triple with "a" without carrier', () => {
            const [subject, verb, complement] = getTriple(
                '<subject> a <type> .',
            );
            assert.equal(subject, '<subject>');
            assert.equal(verb, 'a');
            assert.equal(complement, '<type>');
        });

        it('should parse triple with "a" with carrier', () => {
            const [subject, verb, complement] = getTriple(
                '<subject> a <type> .\n',
            );
            assert.equal(subject, '<subject>');
            assert.equal(verb, 'a');
            assert.equal(complement, '<type>');
        });

        it('should parse triple with a litteral with carrier', () => {
            const [subject, verb, complement] = getTriple(
                '<subject> <verb> "complement" .\n',
            );
            assert.equal(subject, '<subject>');
            assert.equal(verb, '<verb>');
            assert.equal(complement, '"complement"');
        });

        it('should parse triple with a litteral without carrier', () => {
            const [subject, verb, complement] = getTriple(
                '<subject> <verb> "complement" .',
            );
            assert.equal(subject, '<subject>');
            assert.equal(verb, '<verb>');
            assert.equal(complement, '"complement"');
        });
    });
});
