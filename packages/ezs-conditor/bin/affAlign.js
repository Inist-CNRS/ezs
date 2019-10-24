#!/usr/bin/env node

const ezs = require('@ezs/core');
const basics = require('@ezs/basics');
const affAlign = require('../lib');

ezs.use(affAlign);
ezs.use(basics);

process.stdin
    .pipe(ezs('JSONParse'))
    .pipe(ezs('affAlign'))
    .pipe(ezs('JSONString', { indent: true }))
    .pipe(process.stdout);
