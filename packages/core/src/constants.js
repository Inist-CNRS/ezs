import os from 'os';
import debug from 'debug';
import { version } from '../package.json';

export const NCPUS = os.cpus().length;
export const NSHARDS = NCPUS;
export const M_NORMAL = 'normal';
export const M_SINGLE = 'single';
export const M_DISPATCH = 'server';
export const M_CONDITIONAL = 'with';
export const DEBUG = debug('ezs');
export const PORT = 31976;
export const HWM_OBJECT = 16;
export const HWM_BYTES = 16384;
export const VERSION = version;
