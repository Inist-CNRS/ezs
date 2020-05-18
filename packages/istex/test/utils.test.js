import { PassThrough } from 'stream';

const assert = require('assert');
const { getSubject, writeTo, newValue } = require('../src/utils');

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

    describe('writeTo', () => {
        it('should write data to stream', () => {
            const input = new PassThrough({ objectMode: true });
            const data = {
                title: 'Corpus',
                author: 'François',
                publisher: 'CNRS',
                licence: 'CC-By',
                versionInfo: '1',
            };

            writeTo(input, data, () => {
                input.on('data', (chunk) => {
                    assert.deepEqual(chunk, data);
                });
            });
        });
    });

    describe('newValue', () => {
        it('should set the path value to Object', () => {
            const object = { foo: { bar: 'a' } };

            let newObj = newValue('b', 'foo.bar', object);
            assert.deepEqual(newObj, { foo: { bar: 'b' } });

            newObj = newValue('b', 'foo.bar');
            assert.deepEqual(newObj, { foo: { bar: 'b' } });
        });
    });
});
