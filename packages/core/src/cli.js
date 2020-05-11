import _ from 'lodash';
import { realpathSync, createReadStream } from 'fs';
import { PassThrough } from 'stream';
import yargs from 'yargs';
import debug from 'debug';
import ezs from '.';
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
            param: {
                alias: 'p',
                describe: 'Environement parameters',
                type: 'string',
            },
        })
        .epilogue('for more information, find our manual at https://github.com/Inist-CNRS/ezs');

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
        debug('ezs')(`Serving ${serverPath} with ${settings.concurrency} shards`);
        return ezs.createCluster(settings.port, serverPath);
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
    const onlyOne = (item) => (Array.isArray(item) ? item.shift() : item);
    const params = Array.isArray(argv.param) ? argv.param : [argv.param];
    const environement = params
        .filter(Boolean)
        .map((p) => p.split('='))
        .reduce((obj, item) => ({ ...obj, [item[0]]: item[1] }), {});
    const scripts = argv._
        .map((arg) => {
            const script = File(ezs, arg);
            if (!script) {
                errlog(`Error: ${arg} isn't a file.`);
                process.exit(1);
            }
            return script;
        });
    const meta = scripts.map((script) => ezs.metaString(script)).reduce((prev, cur) => _.merge(cur, prev), {});
    const { prepend, append } = meta;
    const prepend2Pipeline = ezs.parseCommand(onlyOne(prepend));
    const append2Pipeline = ezs.parseCommand(onlyOne(append));
    const { server, delegate } = settings;
    const execMode = server ? 'dispatch' : delegate;
    const statements = scripts.map((script) => ezs(execMode, { script, server }, environement));
    if (prepend2Pipeline) {
        statements.unshift(ezs.createCommand(prepend2Pipeline, environement));
    }
    if (append2Pipeline) {
        statements.push(ezs.createCommand(append2Pipeline, environement));
    }
    const output = ezs.createPipeline(input, statements)
        .pipe(ezs.catch((e) => e))
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
