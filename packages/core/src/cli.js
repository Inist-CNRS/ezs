import _ from 'lodash';
import { realpathSync, createReadStream } from 'fs';
import { PassThrough } from 'readable-stream';
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
            tracer: {
                alias: 't',
                default: false,
                describe: 'Enable tracer mode',
                type: 'boolean',
            },
            metrics: {
                alias: 'm',
                default: false,
                describe: 'Enable metrics mode',
                type: 'boolean',
            },
            rpc: {
                alias: 'r',
                default: false,
                describe: 'Enable RPC mode',
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
                describe: 'Execute commands with environment variables as input',
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
                describe: 'Environment parameters',
                type: 'string',
            },
        })
        .epilogue('for more information, find our manual at https://github.com/Inist-CNRS/ezs');

    const { argv } = args;

    if (argv.verbose) {
        debug.enable('ezs');
    }
    if (argv.tracer) {
        settings.tracerEnable = true;
    }
    if (argv.metrics) {
        settings.metricsEnable = true;
    }
    if (argv.rpc) {
        settings.rpcEnable = true;
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
    const params = Array.isArray(argv.param) ? argv.param : [argv.param];
    const environment = params
        .filter(Boolean)
        .map((p) => p.split('='))
        .reduce((obj, item) => {
            const [n, v] = item;
            if (obj[n]) {
                obj[n] = [obj[n], v];
            } else {
                obj[n] = v;
            }
            return obj;
        }, {});
    const scripts = argv._
        .map((arg) => {
            const script = File(ezs, arg);
            if (!script) {
                errlog(`Error: ${arg} isn't a file.`);
                process.exit(1);
            }
            return script;
        });
    const meta = scripts
        .map((script) => ezs.metaString(script))
        .reduce((prev, cur) => _.merge(cur, prev), {});
    const { prepend, append } = meta;
    const script = scripts.reduce((prev, cur) => prev.concat(cur), '');
    const commands = ezs.createCommands({ script, append, prepend });
    const statements = ezs.compileCommands(commands, environment);
    if (settings.metricsEnable) {
        statements.unshift(ezs('metrics', { stage: 'cli', bucket: 'input' }));
        statements.push(ezs('metrics', { stage: 'cli', bucket: 'output' }));
    }
    const output = ezs.createPipeline(input, statements)
        .pipe(ezs.catch())
        .on('error', (e) => {
            errlog(e.message.split('\n').shift());
            process.exit(2);
        })
        .pipe(ezs.toBuffer());
    output.pipe(process.stdout);
    return argv;
}
