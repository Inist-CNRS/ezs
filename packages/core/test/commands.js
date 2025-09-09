import assert from 'assert';
import ezs from '../src';
import Commands from '../src/commands';
import JSONezs from '../src/json';

describe('analsye commands', () => {
    it('with simple pipeline #1', (done) => {
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
    it('with simple pipeline #1 (encode/decode)', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [increment]
            step = fix(1)

            [increment?parallel]
            step = fix(1 + 1)

            [increment?parallel]
            step = fix(1).thru(x => x+2)

            [increment]
            step = 3

            [increment]
            step = 3

        `;
        const commandsParsed = JSONezs.stringify(ezs.parseString(commands));
        const cmdp = new Commands(JSONezs.parse(commandsParsed));
        const commandsAnalysed = cmdp.analyse();
        assert.equal(commandsAnalysed.length, 3);
        assert.equal(commandsAnalysed[0].cmds.length, 2);
        assert.equal(commandsAnalysed[1].cmds.length, 2);
        assert.equal(commandsAnalysed[2].cmds.length, 2);
        done();
    });
    it('check encode/decode', (done) => {
        assert.equal(JSONezs.parse(null), null);
        assert.equal(JSONezs.parse(), undefined);
        assert.equal(JSONezs.parse(false), false);
        assert.equal(JSONezs.parse(''), '');

        assert.equal(JSONezs.stringify(null), null);
        assert.equal(JSONezs.stringify(), undefined);
        assert.equal(JSONezs.stringify(false), false);
        assert.equal(JSONezs.stringify(''), '');
        done();
    });

    it('with simple pipeline #2', (done) => {
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
    it('with parameters', (done) => {
        const script = `

            [assign]
            step = 3

        `;
        const commandsParsed = ezs.createCommands({ script, prepend: 'transit', append: 'dump?indent=true' });
        assert.equal(commandsParsed.length, 3);
        assert.equal(commandsParsed[0].name, 'transit');
        assert.equal(commandsParsed[1].name, 'assign');
        assert.equal(commandsParsed[2].name, 'dump');
        done();
    });
    it('with nested pipeline', (done) => {
        const commands = `

[aaa]
prop = 1

[aaa/bbb]
prop = 2

[ccc]
prop = 3

[ccc/ddd]
prop = 3

[ccc/eee]
prop = 4

[fff]
prop = 5
[fff/ggg]
prop = 6
[fff/ggg/hhh]
prop = 7
[fff/ggg/iii]
prop = 8
[jjj]
prop = 9




        `;
        const commandsParsed = ezs.parseString(commands);
        assert.equal(commandsParsed.length, 4);
        assert.equal(commandsParsed[0].name, 'aaa');
        assert.equal(commandsParsed[0].args.commands.length, 1);
        assert.equal(commandsParsed[0].args.commands[0].name, 'bbb');
        assert.equal(commandsParsed[1].name, 'ccc');
        assert.equal(commandsParsed[1].args.commands.length, 2);
        assert.equal(commandsParsed[1].args.commands[0].name, 'ddd');
        assert.equal(commandsParsed[1].args.commands[1].name, 'eee');
        assert.equal(commandsParsed[2].name, 'fff');
        assert.equal(commandsParsed[2].args.commands.length, 1);
        assert.equal(commandsParsed[2].args.commands[0].name, 'ggg');
        assert.equal(commandsParsed[2].args.commands.length, 1);
        assert.equal(commandsParsed[2].args.commands[0].args.commands.length, 2);
        assert.equal(commandsParsed[2].args.commands[0].args.commands[0].name, 'hhh');
        assert.equal(commandsParsed[2].args.commands[0].args.commands[1].name, 'iii');
        assert.equal(commandsParsed[3].name, 'jjj');
        done();
    });
    it('with nested pipeline (& relative path', (done) => {
        const commands = `

[aaa]
prop = 1

[./bbb]
prop = 2

[ccc]
prop = 3

[./ddd]
prop = 3

[./eee]
prop = 4

[fff]
prop = 5
[*/ggg]
prop = 6
[*/*/hhh]
prop = 7
[?/?/iii]
prop = 8
[jjj]
prop = 9
        `;
        const commandsParsed = ezs.parseString(commands);
        assert.equal(commandsParsed.length, 4);
        assert.equal(commandsParsed[0].name, 'aaa');
        assert.equal(commandsParsed[0].args.commands.length, 1);
        assert.equal(commandsParsed[0].args.commands[0].name, 'bbb');
        assert.equal(commandsParsed[1].name, 'ccc');
        assert.equal(commandsParsed[1].args.commands.length, 2);
        assert.equal(commandsParsed[1].args.commands[0].name, 'ddd');
        assert.equal(commandsParsed[1].args.commands[1].name, 'eee');
        assert.equal(commandsParsed[2].name, 'fff');
        assert.equal(commandsParsed[2].args.commands.length, 1);
        assert.equal(commandsParsed[2].args.commands[0].name, 'ggg');
        assert.equal(commandsParsed[2].args.commands.length, 1);
        assert.equal(commandsParsed[2].args.commands[0].args.commands.length, 2);
        assert.equal(commandsParsed[2].args.commands[0].args.commands[0].name, 'hhh');
        assert.equal(commandsParsed[2].args.commands[0].args.commands[1].name, 'iii');
        assert.equal(commandsParsed[3].name, 'jjj');
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
    it.skip('with invalid property #2', () => { // now, unknow command is trigger at the run
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
});
