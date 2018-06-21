const assert = require('assert');
const ezs = require('../lib');
const Commands = require('../lib/commands').default;

describe('analsye commands', () => {
    it('with simple pipeline', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [increment]
            step = 1

            [increment?single]
            step = 2


            [increment?dispatch]
            step = 3

            [increment]
            step = 3

        `;
        const commandsParsed = ezs.parseString(commands);
        const cmdp = new Commands(commandsParsed);
        const commandsAnalysed = cmdp.analyse();
        assert.equal(commandsAnalysed.length, 3);
        assert.equal(commandsAnalysed[0].cmds.length, 3);
        assert.equal(commandsAnalysed[1].cmds.length, 2);
        done();
    });

    /**/
});
