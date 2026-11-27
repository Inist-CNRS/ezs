import from from 'from';
import ezs from '../src';
import statements from '../src/statements';

ezs.use(statements);

const run = (input, script, params) =>
    new Promise((resolve, reject) => {
        const result = [];
        from(input)
            .pipe(ezs(script, params))
            .pipe(ezs.catch())
            .on('error', reject)
            .on('data', (chunk) => result.push(chunk))
            .on('end', () => resolve(result));
    });

const input = [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }];

describe('ignore', () => {
    it('ignore les N premiers chunks', async () => {
        const res = await run(input, 'ignore', { length: 3 });
        expect(res).toEqual([{ a: 4 }, { a: 5 }]);
    });

    it('ignore un seul chunk avec length = 1', async () => {
        const res = await run(input, 'ignore', { length: 1 });
        expect(res).toEqual([{ a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }]);
    });

    it('laisse tout passer sans paramètre `length`', async () => {
        const res = await run(input, 'ignore');
        expect(res).toEqual(input);
    });

    it('laisse tout passer avec length = 0', async () => {
        const res = await run(input, 'ignore', { length: 0 });
        expect(res).toEqual(input);
    });

    it('ne produit rien si length est égal au nombre de chunks', async () => {
        const res = await run(input, 'ignore', { length: 5 });
        expect(res).toEqual([]);
    });

    it('ne produit rien si length dépasse le nombre de chunks', async () => {
        const res = await run(input, 'ignore', { length: 10 });
        expect(res).toEqual([]);
    });

    it('ne produit rien pour une entrée vide', async () => {
        const res = await run([], 'ignore', { length: 3 });
        expect(res).toEqual([]);
    });

    it('accepte une valeur numérique passée en chaîne', async () => {
        const res = await run(input, 'ignore', { length: '2' });
        expect(res).toEqual([{ a: 3 }, { a: 4 }, { a: 5 }]);
    });
});
