import { workerData } from 'worker_threads';
import process from 'process';
import ezs from '../index.js';

const {
    file,
    script,
    command,
    commands,
    prepend,
    append,
    environment,
    loggerParam,
    settings,
} = workerData;

ezs.settings = settings;
const cds = ezs.createCommands({
    file,
    script,
    command,
    commands,
    prepend,
    append,
});
const statements = ezs.compileCommands(cds, environment);
const logger = ezs.createTrap(loggerParam, environment);
const input = process.stdin
    .pipe(ezs.uncompress())
    .pipe(ezs('unpack'))
    .pipe(ezs('ungroup'));
ezs.createPipeline(input, statements, logger)
    .pipe(ezs('group'))
    .pipe(ezs('pack'))
    .pipe(ezs.compress())
    .pipe(process.stdout);

