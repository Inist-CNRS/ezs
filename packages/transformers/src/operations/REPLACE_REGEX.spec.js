import { replace } from './REPLACE_REGEX';

describe('REPLACE_REGEX', () => {
    it('should return new value from string', () => {
        expect(replace('hello world', 'world', 'you')).toBe('hello you');
    });
    it('should return new value from string', () => {
        expect(replace('hello world', 'wo\\w+', 'you')).toBe('hello you');
    });
    it('should return new value from string', () => {
        expect(replace('hello world', '/wo\\w+/', 'you')).toBe('hello you');
    });
    it('should return new value from string', () => {
        expect(replace('hello world', '\\s*wo\\w+', '')).toBe('hello');
    });
});
