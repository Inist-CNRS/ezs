#!/usr/bin/env node
/* eslint-disable no-console */

const csv = require('csv-string');
const { promises } = require('fs');
const { difference, intersection } = require('ramda');
const { depleteString } = require('../lib/strings');
const { isIn } = require('../lib/rnsr');
const RNSR = require('../data/RNSR.json');

promises
    .readFile(`${__dirname}/../data/2014_AdressesCorpusTest.tsv`, {
        encoding: 'utf8',
    })
    .then((tsv) => csv.parse(tsv, '\t'))
    .then((lines) => {
        console.log('found\texpected\taddress');
        const rnsrAddresses = lines.slice(1);
        let expectedNb = 0;
        const { foundNb, wronglyFoundNb } = rnsrAddresses.reduce(({
            foundNb: alreadyFound,
            wronglyFoundNb: alreadyWronglyFound,
        }, rnsrAddress) => {
            const depletedAddress = depleteString(rnsrAddress[1]);
            const isInAddress = isIn(depletedAddress);
            const rnsrIds = RNSR.structures.structure
                .filter(isInAddress)
                .map((s) => s.num_nat_struct);

            const expectedIds = rnsrAddress[0].split(' ; ');
            expectedNb += expectedIds.length;

            const foundIds = intersection(rnsrIds, expectedIds);
            const wronglyFoundIds = difference(rnsrIds, expectedIds);
            if (foundIds.length < expectedIds.length) {
                console.log(`${rnsrIds}\t${expectedIds}\t${depletedAddress}`);
            } else if (wronglyFoundIds.length) {
                console.log(`${rnsrIds}\t${expectedIds}\t${depletedAddress}`);
            }
            return {
                foundNb: alreadyFound + foundIds.length,
                wronglyFoundNb: alreadyWronglyFound + wronglyFoundIds.length,
            };
        }, { foundNb: 0, wronglyFoundNb: 0 });
        const recall = foundNb / expectedNb;
        console.log('recall:', recall);
        console.log('found:', foundNb);
        console.log('total:', expectedNb);
        const precision = foundNb / (foundNb + wronglyFoundNb);
        console.log('precision:', precision);
        console.log('wrongs:', wronglyFoundNb);
        console.log('total found:', foundNb + wronglyFoundNb);
    });
