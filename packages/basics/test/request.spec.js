import { convertError } from '../src/request';

describe('convertError', () => {
    test('keeps the status and the answer of the server', () => {
        const error = Object.assign(new Error('Service Unavailable'), {
            status: 503,
            responseText: 'Maintenance',
        });
        const standardError = convertError(error);
        expect(standardError.message).toBe('Service Unavailable');
        expect(standardError.status).toBe(503);
        expect(standardError.responseText).toBe('Maintenance');
    });
    test('keeps the status and the answer of the cause', () => {
        const error = new Error('Request failed', {
            cause: Object.assign(new Error('Not Found'), {
                status: 404,
                responseText: 'No such page',
            }),
        });
        const standardError = convertError(error);
        expect(standardError.message).toBe('Request failed : Not Found');
        expect(standardError.status).toBe(404);
        expect(standardError.responseText).toBe('No such page');
    });
    test('adds nothing to an error without answer', () => {
        const standardError = convertError(new Error('fetch failed'));
        expect(Object.getOwnPropertyNames(standardError).sort()).toEqual([
            'message',
            'stack',
        ]);
    });
});
