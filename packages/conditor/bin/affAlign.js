#!/usr/bin/env node
/* eslint-disable import/no-unresolved */
// @ezs/core and @ezs/basics have to be installed

const ezs = require('@ezs/core');
const basics = require('../../basics/lib');
const affAlign = require('../lib');

ezs.use(affAlign);
ezs.use(basics);

process.stdin
    .pipe(ezs('JSONParse'))
    .pipe(ezs('affAlign'))
    .pipe(ezs('JSONString', { indent: true }))
    .pipe(process.stdout);
