import { realpathSync, createReadStream } from 'fs';
import { PassThrough } from 'stream';
import yargs from 'yargs';
import debug from 'debug';
import ezs from '.';
import Commands from './commands';
import File from './file';
import { version } from '../package.json';
import settings from './settings';

export default function cli(errlog) {
    const args = yargs
        .env('EZS')
        .usage('Usage: $0 [options] [<file>|<directory>] [<file2> <file3> ...]')
        .version(version)
        .options({
            verbose: {
                alias: 'v',
                default: false,
                describe: 'Enable debug mode with DEBUG=ezs',
                type: 'boolean',
            },
            daemon: {
                alias: 'd',
                describe: 'Launch daemon on a directory containing commands script',
                type: 'string',
            },
            slave: {
                alias: 'sl',
                describe: 'Launch slave daemon to execute remote commands',
                type: 'string',
            },
            server: {
                alias: 's',
                describe: 'Server to dispach commands',
                type: 'string',
            },
            env: {
                alias: 'e',
                default: false,
                describe: 'Execute commands with environement variables as input',
                type: 'boolean',
            },
            file: {
                alias: 'f',
                default: false,
                describe: 'Execute commands with a file as input',
                type: 'string',
            },

        })
        .epilogue('for more information, find our manual at https://github.com/touv/node-ezs');

    const { argv } = args;


    if (argv.verbose) {
        debug.enable('ezs');
    }
    if (argv.daemon) {
        let serverPath;
        try {
            serverPath = realpathSync(argv.daemon);
        } catch (e) {
            errlog(`Error: ${argv.daemon} doesn't exists.`);
            process.exit(1);
        }
        debug('ezs')(`Serving ${settings.path} with ${settings.nShards} shards`);
        return ezs.createCluster(settings.port, serverPath);
    }
    if (argv.slave) {
        debug('ezs')(`Waiting for remote commands with ${settings.nShards} shards`);
        return ezs.createCluster(settings.port, false);
    }

    if (argv._.length === 0) {
        yargs.showHelp();
        return process.exit(1);
    }

    let input;
    if (argv.env) {
        debug('ezs')('Reading environment variables...');
        input = new PassThrough(ezs.objectMode());
        input.write(process.env);
        input.end();
    } else if (argv.file) {
        try {
            const filename = realpathSync(argv.file);
            debug('ezs')(`Reading file ${filename} ...`);
            input = createReadStream(filename);
        } catch (e) {
            errlog(`Error: ${argv.file} doesn't exists.`);
            process.exit(1);
        }
    } else {
        debug('ezs')('Reading standard input...');
        input = process.stdin;
        input.resume();
    }
    const server = Array.isArray(argv.server) ? argv.server : [argv.server];
    const environement = { server };

    const selectFunc = (func, cmds) => {
        if (func === 'pipeline') {
            return ezs('delegate', {
                commands: cmds,
            },
            environement);
        }
        return ezs('dispatch', {
            commands: cmds,
            server,
            environement,
        });
    };
    const pipeCommand = (stream, command, environment) => stream.pipe(ezs.createCommand(command, environment));
    const runScriptRemote = (strm, cmds) => {
        debug('ezs')('Connecting to server...');
        const runplan = cmds.analyse();
        const usecmds = cmds.getUseCommands();
        const stream0 = usecmds.reduce(pipeCommand, strm);
        return runplan.reduce((stream, section) => stream.pipe(selectFunc(section.func, section.cmds)), stream0);
    };
    const runScriptLocal = (strm, cmds) => strm
        .pipe(ezs('delegate', { commands: cmds.get() }, environement));
    const runScript = (serverMode) => {
        if (serverMode) {
            return runScriptRemote;
        }
        return runScriptLocal;
    };
    const output = argv._
        .map((arg) => {
            const script = File(ezs, arg);
            if (!script) {
                errlog(`Error: ${arg} isn't a file.`);
                process.exit(1);
            }
            return script;
        })
        .map(script => new Commands(ezs.parseString(script)))
        .reduce(runScript(argv.server), input)
        .pipe(ezs.catch(e => e))
        .on('error', (e) => {
            errlog(e.message.split('\n').shift());
            process.exit(2);
        })
        .pipe(ezs.toBuffer());
    output.on('end', () => {
        process.exit(0);
    });
    output.pipe(process.stdout);
    return argv;
}
