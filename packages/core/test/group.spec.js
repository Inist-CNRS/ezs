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

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

describe('group', () => {
    it('regroupe les chunks par `length`, le dernier groupe étant partiel', async () => {
        const res = await run(letters, 'group', { length: 3 });
        expect(res).toEqual([
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h'],
        ]);
    });

    it('n\'émet pas de groupe vide quand le nombre de chunks est un multiple de la taille', async () => {
        const res = await run(['a', 'b', 'c', 'd'], 'group', { length: 2 });
        expect(res).toEqual([
            ['a', 'b'],
            ['c', 'd'],
        ]);
    });

    it('accepte `size` comme paramètre', async () => {
        const res = await run(letters, 'group', { size: 4 });
        expect(res).toEqual([
            ['a', 'b', 'c', 'd'],
            ['e', 'f', 'g', 'h'],
        ]);
    });

    it('`size` est prioritaire sur `length`', async () => {
        const res = await run(['a', 'b', 'c', 'd'], 'group', {
            length: 3,
            size: 2,
        });
        expect(res).toEqual([
            ['a', 'b'],
            ['c', 'd'],
        ]);
    });

    it('utilise la taille par défaut (highWaterMark) sans paramètre', async () => {
        const input = Array.from({ length: 5 }, (_, i) => i);
        const res = await run(input, 'group');
        // Avec 5 éléments (< highWaterMark par défaut), un seul groupe est émis
        expect(res).toEqual([input]);
    });

    it('place chaque groupe sous `path` quand il est fourni', async () => {
        const res = await run(letters, 'group', { length: 3, path: 'items' });
        expect(res).toEqual([
            { items: ['a', 'b', 'c'] },
            { items: ['d', 'e', 'f'] },
            { items: ['g', 'h'] },
        ]);
    });

    it('supporte un `path` imbriqué', async () => {
        const res = await run(['a', 'b', 'c'], 'group', {
            length: 2,
            path: 'a.b',
        });
        expect(res).toEqual([{ a: { b: ['a', 'b'] } }, { a: { b: ['c'] } }]);
    });

    it('regroupe des objets', async () => {
        const input = [{ x: 1 }, { x: 2 }, { x: 3 }];
        const res = await run(input, 'group', { length: 2 });
        expect(res).toEqual([[{ x: 1 }, { x: 2 }], [{ x: 3 }]]);
    });

    it('ne produit rien pour une entrée vide', async () => {
        const res = await run([], 'group', { length: 3 });
        expect(res).toEqual([]);
    });

    it('avec une taille de 1, chaque chunk devient un tableau d\'un élément', async () => {
        const res = await run(['a', 'b'], 'group', { length: 1 });
        expect(res).toEqual([['a'], ['b']]);
    });
});
