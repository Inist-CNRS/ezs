import fs from 'fs';
import yargs from 'yargs';
import ezs from '.';
import Commands from './commands';
import { version } from '../package.json';


export default function cli(printer) {
    const args = yargs
        .env('EZS')
        .usage('Usage: $0 [options] [<file>]')
        .version(version)
        .options({
            verbose: {
                alias: 'v',
                default: false,
                describe: 'Print some informations',
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
        })
        .epilogue('for more information, find our manual at https://github.com/touv/node-ezs');

    const argv = args.argv;
    const firstarg = argv._.shift();

    if (argv.daemon) {
        ezs.createCluster();
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
            printer.error(`${firstarg} doesn't exists.`);
            yargs.showHelp();
            process.exit(1);
        }

        if (!fs.statSync(file).isFile()) {
            printer.error(`${firstarg} isn't a file.`);
            yargs.showHelp();
            process.exit(1);
        }

        const script = fs.readFileSync(file).toString();
        const cmds = new Commands(ezs.parseString(script));

        if (argv.verbose) {
            printer.error('Reading standard input...');
        }

        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        const servers = Array.isArray(argv.server) ? argv.server : [argv.server];
        let stream1;
        if (argv.server) {
            const runplan = cmds.analyse();
            stream1 = runplan.reduce((stream, section) => {
                if (section.func === 'pipeline') {
                    return stream.pipe(ezs.pipeline(section.cmds));
                }
                return stream.pipe(ezs.dispatch(section.cmds, servers));
            }, process.stdin);
        } else {
            stream1 = process.stdin.pipe(ezs.pipeline(cmds.get()));
        }
        const stream2 = stream1.pipe(ezs.toBuffer());
        stream2.on('end', () => {
            process.exit(1);
        });
        stream2.pipe(process.stdout);
    }
}
