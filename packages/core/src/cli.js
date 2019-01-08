import fs from 'fs';
import { PassThrough } from 'stream';
import yargs from 'yargs';
import debug from 'debug';
import { DEBUG } from './constants';
import ezs from '.';
import Commands from './commands';
import { version } from '../package.json';

export default function cli(errlog) {
    const args = yargs
        .env('EZS')
        .usage('Usage: $0 [options] [<file>]')
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
                default: false,
                describe: 'Launch daemon',
                type: 'boolean',
            },
            server: {
                alias: 's',
                describe: 'Server to dispach commands',
                type: 'string',
            },
            port: {
                alias: 'p',
                describe: 'Change daemon\'port',
                default: 31976,
                type: 'number',
            },
            highWaterMark: {
                describe: 'Change high water mark',
                default: '16:16384',
                type: 'string',
            },
            nShards: {
                describe: 'Change number of shards',
                type: 'number',
            },
            env: {
                alias: 'e',
                default: false,
                describe: 'Execute commands with environement variables as input',
                type: 'boolean',
            },
            input: {
                alias: 'i',
                describe: 'Execute commands with a dedicated directory as input',
                type: 'string',
            },
            output: {
                alias: 'o',
                describe: 'Save result output to a dedicated directory',
                type: 'string',
            },

        })
        .epilogue('for more information, find our manual at https://github.com/touv/node-ezs');

    const { argv } = args;
    const firstarg = argv._.shift();
    const { port } = argv;

    if (argv.verbose) {
        debug.enable('ezs');
    }
    if (argv.highWaterMark) {
        ezs.settings.highWaterMark = argv.highWaterMark.split(':').map(x => Number(x));
    }
    if (args.nShards) {
        ezs.settings.nShards = argv.nShards;
    }

    if (argv.daemon) {
        return ezs.createCluster(port);
    }

    if (!argv.daemon && !firstarg) {
        yargs.showHelp();
        process.exit(1);
    }


    if (firstarg) {
        let file;
        try {
            file = fs.realpathSync(firstarg);
        } catch (e) {
            errlog(`${firstarg} doesn't exists.`);
            yargs.showHelp();
            process.exit(1);
        }

        if (!fs.statSync(file).isFile()) {
            errlog(`${firstarg} isn't a file.`);
            yargs.showHelp();
            process.exit(1);
        }

        const script = fs.readFileSync(file).toString();
        const cmds = new Commands(ezs.parseString(script));

        let environement;
        let input;
        if (argv.env) {
            DEBUG('Reading environement variables...');
            environement = {};
            input = new PassThrough(ezs.objectMode());
            input.write(process.env);
            input.end();
        } else if (argv.input) {
            DEBUG('Reading diretory input...');
            environement = { ...process.env };
            input = ezs.load(argv.input);
        } else {
            DEBUG('Reading standard input...');
            environement = { ...process.env };
            input = process.stdin;
            input.resume();
            input.setEncoding('utf8');
        }

        const servers = Array.isArray(argv.server) ? argv.server : [argv.server];
        let stream1;
        if (argv.server) {
            DEBUG('Connecting to server...');
            const runplan = cmds.analyse();
            const usecmds = cmds.getUseCommands();
            const stream0 = usecmds.reduce(ezs.command, input);
            stream1 = runplan.reduce((stream, section) => {
                if (section.func === 'pipeline') {
                    return stream.pipe(ezs.pipeline(section.cmds, environement));
                }
                return stream.pipe(ezs.dispatch(section.cmds, servers, environement));
            }, stream0);
        } else {
            stream1 = input.pipe(ezs.pipeline(cmds.get(), environement));
        }
        if (argv.output) {
            const stream2a = stream1.pipe(ezs.save(argv.output));
            stream2a.on('end', () => {
                process.exit(0);
            });
        } else {
            const stream2b = stream1.pipe(ezs.toBuffer());
            stream2b.on('end', () => {
                process.exit(0);
            });
            stream2b.pipe(process.stdout);
        }
    }
    return argv;
}
