#!/usr/bin/env node
/* eslint-disable no-console */

const ezs = require('@ezs/core');
const ezsBasics = require('@ezs/basics');

ezs.use(ezsBasics);

process.stdin
    .pipe(ezs('JSONParse'))
    .pipe(ezs(function compareRnsr(data, feed) {
        if (this.isLast()) {
            const recall = this.stats.correct / this.stats.total;
            console.log(`recall: ${recall}`);
            console.log(`correct: ${this.stats.correct}`);
            console.log(`total: ${this.stats.total}`);
            return feed.close();
        }
        if (this.isFirst()) {
            this.stats = {
                correct: 0,
                total: 0,
            };
        }

        this.stats = data.authors.reduce(
            (authStats, author) => author.affiliations.reduce(
                (stats, affiliation) => ({
                    correct: affiliation.rnsr.reduce(
                        (correct, rnsr) => correct + (affiliation.conditorRnsr.includes(rnsr) ? 1 : 0),
                        stats.correct,
                    ),
                    total: stats.total + affiliation.rnsr.length,
                }),
                authStats,
            ),
            this.stats,
        );
        return feed.end();
    }));
