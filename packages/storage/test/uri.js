import ezs from '../../core/src';
import statements from '../src';
import { ncda, validKey } from '../src/identify';

ezs.use(statements);

describe('validKey', () => {
    test('with null', () => {
        expect(validKey()).toBe(false);
    });
    test('with blank', () => {
        expect(validKey('')).toBe(false);
    });
    test('with object', () => {
        expect(validKey({})).toBe(false);
    });
    test('with number', () => {
        expect(validKey(12345)).toBe(false);
    });
    test('with no slash', () => {
        expect(validKey('uid:XXX-YYYYYYYY-Z')).toBe(true);
    });
    test('with strange scheme', () => {
        expect(validKey('toto:/XXX-YYYYYYYY-Z')).toBe(true);
    });
    test('with no scheme', () => {
        expect(validKey('XXX-YYYYYYYY-Z')).toBe(false);
    });
    test('with uri', () => {
        expect(validKey('uid:/XXX')).toBe(true);
    });
    test('with ark', () => {
        expect(validKey('ark:/67375/6H6-05FM5LNG-3')).toBe(true);
    });
});

describe('ncda', () => {
    test('with null', () => {
        expect(ncda()).toBe('');
    });
    test('with null (bis)', () => {
        expect(ncda(null, ['a', 'b'])).toBe('');
    });
    test('with blank', () => {
        expect(ncda('')).toBe('');
    });
    test('with blank (bis)', () => {
        expect(ncda('', ['a', 'b'])).toBe('');
    });
    test('with object', () => {
        expect(ncda({})).toBe('');
    });
    test('with object (bis)', () => {
        expect(ncda({}, ['a', 'b'])).toBe('');
    });
    test('with string #1', () => {
        expect(ncda('12345', '12345')).toBe('1');
    });
    test('with string #2', () => {
        expect(ncda('345', '12345')).toBe('1');
    });
    test('with string #3', () => {
        expect(ncda('121212123', '12345')).toBe('4');
    });
    test('with string but no alphabet', () => {
        expect(ncda('12345')).toBe('');
    });
    test('with string no restricted alphabet', () => {
        expect(ncda('12345', '12')).toBe('1');
    });
    test('with string incompatible alphabet', () => {
        expect(ncda('12345', 'AB')).toBe('A');
    });
    test('with number and no alphabet', () => {
        expect(ncda(12345)).toBe('');
    });
    test('with number and special alphabet', () => {
        expect(ncda(12345, [1, 2, 3, 4, 5])).toBe('');
    });
    test('with number and special alphabet', () => {
        expect(ncda(121212123, [1, 2, 3, 4, 5])).toBe('');
    });
});
