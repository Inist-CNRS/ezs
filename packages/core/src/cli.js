import fs from 'fs';
import { PassThrough } from 'stream';
import yargs from 'yargs';
import debug from 'debug';
import { DEBUG } from './constants';
import ezs from '.';
import config from './config';
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
            env: {
                alias: 'e',
                default: false,
                describe: 'Execute commands with environement variables as input',
                type: 'boolean',
            },
        })
        .epilogue('for more information, find our manual at https://github.com/touv/node-ezs');

    const argv = args.argv;
    const firstarg = argv._.shift();
    const port =  argv.port;
    config.port = port;

    if (argv.verbose) {
        debug.enable('ezs');
    }

    if (argv.daemon) {
        ezs.createCluster(port);
        if (!argv.server) {
            argv.server = '127.0.0.1';
        }
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

        const input = argv.env ? new PassThrough({ objectMode: true }) : process.stdin;

        if (argv.env) {
            // Use Env vars as INPUT
            DEBUG('Reading environement variables...');
            input.write(process.env);
            input.end();
        } else {
            // Use STDIN as INPUT
            DEBUG('Reading standard input...');
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
                    return stream.pipe(ezs.pipeline(section.cmds));
                }
                return stream.pipe(ezs.dispatch(section.cmds, servers));
            }, stream0);
        } else {
            stream1 = input.pipe(ezs.pipeline(cmds.get()));
        }
        const stream2 = stream1.pipe(ezs.toBuffer());
        stream2.on('end', () => {
            process.exit(1);
        });
        stream2.pipe(process.stdout);
    }
}
