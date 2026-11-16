import assert from 'assert';
import from from 'from';
import ezs from '../src';

ezs.use(require('./locals'));

// Statements locaux propres à ces tests
ezs.use({
    // émet chaque valeur deux fois
    duplicate(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        feed.write(data);
        feed.write(data);
        return feed.end();
    },
    // échoue systématiquement
    failing(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        return feed.stop(new Error('boom'));
    },
});

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;

// Exécute reduce sur `input` et renvoie les chunks reçus (triés : les workers sont parallèles)
const run = (input, params) =>
    new Promise((resolve, reject) => {
        const res = [];
        from(input)
            .pipe(ezs('reduce', params))
            .on('error', reject)
            .on('data', (chunk) => res.push(chunk))
            .on('end', () => resolve(res.sort((a, b) => a - b)));
    });

const stepper = (step) => [{ name: 'stepper', args: { step } }];

describe('reduce', () => {
    it('with commands using global parameter', (done) => {
        let res = 0;
        from([[1, 2, 3]])
            .pipe(ezs('reduce', { commands: stepper(4) }))
            .on('error', (e) => done(e))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 18);
                done();
            });
    });

    it('with a script parameter', async () => {
        const script = '[stepper]\nstep = 4\n';
        const res = await run([[1, 2, 3]], { script });
        assert.deepStrictEqual(res, [5, 6, 7]);
    });

    it('with a URL-like command parameter', async () => {
        const res = await run([[1, 2, 3]], { command: 'stepper?step=4' });
        assert.deepStrictEqual(res, [5, 6, 7]);
    });

    it('with a different step value', async () => {
        const res = await run([[10, 20]], { commands: stepper(1) });
        assert.deepStrictEqual(res, [11, 21]);
    });

    it('with a scalar chunk (not an array)', async () => {
        const res = await run([7], { commands: stepper(4) });
        assert.deepStrictEqual(res, [11]);
    });

    it('with several array chunks, each handled independently', async () => {
        const res = await run(
            [
                [1, 2],
                [3, 4],
            ],
            { commands: stepper(4) }
        );
        assert.deepStrictEqual(res, [5, 6, 7, 8]);
    });

    it('with a mix of scalar and array chunks', async () => {
        const res = await run([1, [2, 3]], { commands: stepper(4) });
        assert.deepStrictEqual(res, [5, 6, 7]);
    });

    it('with an empty array chunk', async () => {
        const res = await run([[]], { commands: stepper(4) });
        assert.deepStrictEqual(res, []);
    });

    it('without any input', async () => {
        const res = await run([], { commands: stepper(4) });
        assert.deepStrictEqual(res, []);
    });

    it('with a large array (one worker per item)', async () => {
        const input = Array.from({ length: 50 }, (_, i) => i);
        const res = await run([input], { commands: stepper(100) });
        assert.deepStrictEqual(
            res,
            input.map((i) => i + 100)
        );
    });

    it('with a pipeline emitting several chunks per item', async () => {
        const res = await run([[1, 2]], {
            commands: [{ name: 'duplicate', args: {} }],
        });
        assert.deepStrictEqual(res, [1, 1, 2, 2]);
    });

    it('with a pipeline of several commands', async () => {
        const commands = [
            ...stepper(1),
            { name: 'duplicate', args: {} },
            ...stepper(10),
        ];
        const res = await run([[1, 2]], { commands });
        assert.deepStrictEqual(res, [12, 12, 13, 13]);
    });

    it('with a failing pipeline', (done) => {
        from([[1, 2, 3]])
            .pipe(ezs('reduce', { commands: [{ name: 'failing', args: {} }] }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(/boom/.test(e.message));
                done();
            })
            .on('end', () => done(new Error('an error was expected')));
    });
});
