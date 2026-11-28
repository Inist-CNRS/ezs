import { pipeline } from 'stream';
import assert from 'assert';
import from from 'from';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import fs from 'fs/promises';
import cacache from 'cacache';
import ezs from '../src/index.js';
import spawnCache, {
    cacheGet,
    cachePut,
    cleanupCache,
} from '../src/statements/cache.js';

const HOUR = 60 * 60 * 1000;
// Infinity désactive le nettoyage automatique : les tests restent déterministes
const NO_AUTO_CLEANUP = Infinity;

let cachePath;
let now;

const advance = (ms) => {
    now += ms;
};

beforeEach(async () => {
    cachePath = await fs.mkdtemp(join(tmpdir(), 'cache-test-'));
    now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
});

afterEach(async () => {
    jest.restoreAllMocks();
    await fs.rm(cachePath, { recursive: true, force: true });
});

describe('cacheGet / cachePut', () => {
    it('renvoie null pour une clé absente', async () => {
        expect(await cacheGet(cachePath, 'absent')).toBeNull();
    });

    it('renvoie la valeur stockée', async () => {
        const value = { a: 1, b: ['x', 'y'] };
        await cachePut(cachePath, 'key', value, HOUR, NO_AUTO_CLEANUP);

        expect(await cacheGet(cachePath, 'key', HOUR)).toEqual(value);
    });

    it('ne stocke rien pour null ou undefined', async () => {
        expect(await cachePut(cachePath, 'k1', null)).toBe(false);
        expect(await cachePut(cachePath, 'k2', undefined)).toBe(false);
        expect(await cacache.get.info(cachePath, 'k1')).toBeNull();
        expect(await cacache.get.info(cachePath, 'k2')).toBeNull();
    });

    it('renvoie null une fois le TTL dépassé', async () => {
        await cachePut(cachePath, 'key', { a: 1 }, HOUR, NO_AUTO_CLEANUP);

        advance(HOUR - 1);
        expect(await cacheGet(cachePath, 'key', HOUR)).toEqual({ a: 1 });

        advance(2);
        expect(await cacheGet(cachePath, 'key', HOUR)).toBeNull();
    });

    it('applique le TTL passé à la lecture', async () => {
        await cachePut(cachePath, 'key', { a: 1 }, HOUR, NO_AUTO_CLEANUP);
        advance(2 * HOUR);

        expect(await cacheGet(cachePath, 'key', HOUR)).toBeNull();
        expect(await cacheGet(cachePath, 'key', 3 * HOUR)).toEqual({ a: 1 });
    });
});

describe('entrées corrompues', () => {
    it('renvoie null et supprime une entrée au JSON invalide', async () => {
        await cacache.put(cachePath, 'bad', 'not json {');

        expect(await cacheGet(cachePath, 'bad', HOUR)).toBeNull();
        expect(await cacache.get.info(cachePath, 'bad')).toBeNull();
    });

    it('renvoie null et supprime une entrée dont le contenu est altéré', async () => {
        await cachePut(cachePath, 'key', { a: 1 }, HOUR, NO_AUTO_CLEANUP);
        const info = await cacache.get.info(cachePath, 'key');
        // Les fichiers de contenu sont en lecture seule : on remplace le fichier
        await fs.rm(info.path);
        await fs.writeFile(info.path, 'contenu altéré');

        expect(await cacheGet(cachePath, 'key', HOUR)).toBeNull();
        expect(await cacache.get.info(cachePath, 'key')).toBeNull();
    });

    it('renvoie null et supprime une entrée dont le contenu a disparu', async () => {
        await cachePut(cachePath, 'key', { a: 1 }, HOUR, NO_AUTO_CLEANUP);
        const info = await cacache.get.info(cachePath, 'key');
        await fs.rm(info.path);

        expect(await cacheGet(cachePath, 'key', HOUR)).toBeNull();
        expect(await cacache.get.info(cachePath, 'key')).toBeNull();
    });
});

describe('cleanupCache', () => {
    it('supprime les entrées expirées et leur contenu, conserve les autres', async () => {
        await cachePut(cachePath, 'old', { v: 'old' }, HOUR, NO_AUTO_CLEANUP);
        const oldInfo = await cacache.get.info(cachePath, 'old');

        advance(2 * HOUR);
        await cachePut(
            cachePath,
            'fresh',
            { v: 'fresh' },
            HOUR,
            NO_AUTO_CLEANUP
        );

        await cleanupCache(cachePath, HOUR);

        expect(await cacache.get.info(cachePath, 'old')).toBeNull();
        expect(
            await cacache.get.hasContent(cachePath, oldInfo.integrity)
        ).toBeFalsy();
        expect(await cacheGet(cachePath, 'fresh', HOUR)).toEqual({
            v: 'fresh',
        });
    });

    it('ne supprime rien quand aucune entrée n’est expirée', async () => {
        await cachePut(cachePath, 'a', { v: 1 }, HOUR, NO_AUTO_CLEANUP);
        await cachePut(cachePath, 'b', { v: 2 }, HOUR, NO_AUTO_CLEANUP);

        await cleanupCache(cachePath, HOUR);

        expect(await cacheGet(cachePath, 'a', HOUR)).toEqual({ v: 1 });
        expect(await cacheGet(cachePath, 'b', HOUR)).toEqual({ v: 2 });
    });

    it('fonctionne sur un cache vide', async () => {
        await expect(cleanupCache(cachePath, HOUR)).resolves.toBeUndefined();
    });
});

ezs.use(require('./locals')); // increment, decrement, boum

// Statements utilitaires, locaux à ce fichier de test
let calls = 0;
ezs.use({
    spawnCache,
    // compte le nombre d'objets réellement traités par le sous-pipeline
    countCalls(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        calls += 1;
        return feed.send(data);
    },
    // émet chaque objet deux fois (un objet en entrée -> deux objets en sortie)
    dupe(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        feed.write(data);
        feed.write(data);
        return feed.end();
    },
});

const incDec = [
    { name: 'countCalls' },
    { name: 'increment', args: { step: 3 } },
    { name: 'decrement', args: { step: 2 } },
];

const sum = (list) => list.reduce((a, b) => a + b, 0);

// Exécute spawnCache sur `input` et renvoie tous les objets en sortie (rejette à la première erreur)
const run = (input, params, env) =>
    new Promise((resolve, reject) => {
        const res = [];
        pipeline(
            from(input),
            ezs('spawnCache', params, env),
            ezs.catch(),
            (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            }
        ).on('data', (chunk) => res.push(chunk));
    });

// Fournit un répertoire de cache jetable à chaque test
const withLocation = async (fn) => {
    const location = mkdtempSync(join(tmpdir(), 'spawn-cache-'));
    try {
        await fn(location);
    } finally {
        rmSync(location, { recursive: true, force: true });
    }
};

describe('spawnCache', () => {
    it('miss puis hit : même résultat, sous-pipeline exécuté une seule fois', () =>
        withLocation(async (location) => {
            calls = 0;
            const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            const first = await run(input, { commands: incDec, location });
            assert.strictEqual(sum(first), 54);
            assert.strictEqual(calls, 9);

            const second = await run(input, { commands: incDec, location });
            assert.strictEqual(sum(second), 54);
            assert.strictEqual(
                calls,
                9,
                'le sous-pipeline ne doit pas être exécuté sur un hit'
            );
        }));

    it('un objet qui produit plusieurs sorties est rejoué en entier depuis le cache', () =>
        withLocation(async (location) => {
            calls = 0;
            const commands = [{ name: 'countCalls' }, { name: 'dupe' }];
            const input = [{ a: 1 }, { a: 2 }, { a: 3 }];

            const first = await run(input, { commands, location });
            assert.strictEqual(first.length, 6);
            assert.strictEqual(calls, 3);

            const second = await run(input, { commands, location });
            assert.deepStrictEqual(second, first);
            assert.strictEqual(calls, 3);
        }));

    it('conserve les types JSON (objets, tableaux, UTF8)', () =>
        withLocation(async (location) => {
            const commands = [{ name: 'dupe' }];
            const input = [
                { id: 'Les Châtiments', tags: ['a', 'b'], n: { x: 1 } },
            ];

            const first = await run(input, { commands, location });
            const second = await run(input, { commands, location });
            assert.deepStrictEqual(second, first);
            assert.strictEqual(second[0].id, 'Les Châtiments');
            assert.deepStrictEqual(second[1].tags, ['a', 'b']);
        }));

    it.skip('un autre sous-pipeline donne une autre entrée de cache', () =>
        withLocation(async (location) => {
            const input = [1, 2, 3];
            const plusOne = [{ name: 'increment', args: { step: 1 } }];
            const plusTwo = [{ name: 'increment', args: { step: 2 } }];

            assert.strictEqual(
                sum(await run(input, { commands: plusOne, location })),
                9
            );
            assert.strictEqual(
                sum(await run(input, { commands: plusTwo, location })),
                12
            );
            // et chacun reste servi par son propre cache
            assert.strictEqual(
                sum(await run(input, { commands: plusOne, location })),
                9
            );
        }));

    it('avec un paramètre key explicite, deux entrées partagent le même cache', () =>
        withLocation(async (location) => {
            const params = { commands: incDec, location, key: 'fixed' };

            const first = await run([1], params);
            const second = await run([5], params); // aurait donné 6 sans la clé commune
            assert.deepStrictEqual(first, [2]);
            assert.deepStrictEqual(second, [2]);
        }));

    it('ne met pas en cache un sous-pipeline en erreur', () =>
        withLocation(async (location) => {
            calls = 0;
            const commands = [{ name: 'countCalls' }, { name: 'boum' }];

            await assert.rejects(run([1, 2], { commands, location }));
            const afterFirst = calls;
            assert.ok(afterFirst > 0);

            await assert.rejects(run([1, 2], { commands, location }));
            assert.ok(
                calls > afterFirst,
                'le sous-pipeline doit être ré-exécuté après une erreur'
            );
        }));

    it('ignore une entrée expirée (ttl)', () =>
        withLocation(async (location) => {
            calls = 0;
            const params = { commands: incDec, location, ttl: 1 };

            await run([1], params);
            assert.strictEqual(calls, 1);

            advance(2);

            await run([1], params);
            assert.strictEqual(
                calls,
                2,
                'une entrée plus vieille que le ttl ne doit pas être servie'
            );
        }));

    it('fonctionne avec un script', () =>
        withLocation(async (location) => {
            calls = 0;
            const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 3

            [decrement]
            step = 2
        `;
            const input = [1, 2, 3];

            const first = await run(input, { script, location });
            const second = await run(input, { script, location });
            assert.strictEqual(sum(first), 9);
            assert.deepStrictEqual(second, first);
        }));
});
