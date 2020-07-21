import assert from 'assert';
import ezs from '../src';
import Commands from '../src/commands';

describe('analsye commands', () => {
    it('with simple pipeline', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [increment]
            step = 1

            [increment?parallel]
            step = 2

            [increment?parallel]
            step = 2

            [increment]
            step = 3

            [increment]
            step = 3

        `;
        const commandsParsed = ezs.parseString(commands);
        const cmdp = new Commands(commandsParsed);
        const commandsAnalysed = cmdp.analyse();
        assert.equal(commandsAnalysed.length, 3);
        assert.equal(commandsAnalysed[0].cmds.length, 2);
        assert.equal(commandsAnalysed[1].cmds.length, 2);
        assert.equal(commandsAnalysed[2].cmds.length, 2);
        done();
    });
    it('with simple pipeline', (done) => {
        const commands = `

            [package:increment]
            step = 1

            [package:increment?single]
            step = 2

            [assign?detachable]
            step = 3

            [assign]
            step = 3

        `;
        const commandsParsed = ezs.parseString(commands);
        assert.equal(commandsParsed[0].use, 'package');
        assert.equal(commandsParsed[1].use, 'package');
        assert.equal(commandsParsed[2].use, '');
        assert.equal(commandsParsed[3].use, '');
        done();
    });
    /**/
});

describe('create command', () => {
    const environment = {};
    it('with invalid property #1', () => {
        const command = {
            name: '',
            use: '',
            mode: '',
        };
        assert.throws(() => (ezs.createCommand(command, environment)));
    });
    it('with invalid property #2', () => {
        const command = {
            name: 'toto',
            use: '',
            mode: 'toto',
        };
        assert.throws(() => (ezs.createCommand(command, environment)));
    });
    it('with invalid property #3', () => {
        const command = {
            name: 'toto',
            use: 'titi',
        };
        assert.throws(() => (ezs.createCommand(command, environment)));
    });
});
describe('compile command', () => {
    const environment = {};
    it('with no command #1', () => {
        assert.throws(() => (ezs.compileCommands(null, environment)));
    });
    it('with empty commands', (done) => {
        const strm = ezs.compileCommands([], environment).shift();
        strm.on('data', (chunk) => {
            assert.strictEqual(chunk, 'OK');
        });
        strm.on('end', () => {
            done();
        });
        strm.write('OK');
        strm.end();
    });
});
describe('memoize', () => {
    it('with invalid key', () => {
        expect(ezs.memoize(null, () => true)).toBeTruthy();
        expect(ezs.memoize(null, () => true)).toBeTruthy();
        expect(ezs.memoize(null, () => true)).toBeTruthy();
    });
})
