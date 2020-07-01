/**
 * @jest-environment node
 */


import assert from 'assert';
import from from 'from';
import ezs from '../../core/src';
import ezsIstex from '../src';
import expectedResult from './data/exchangeExpectedResult'

ezs.use(ezsIstex);

import {reviewManager} from 'istex-exchange';


describe('Istex-exchange', function() {
  it('Should build exchange object with coverage with no error', function(done) {
    const results = [];

    reviewManager.findDocumentsBy({type: 'serial', maxSize: 25})
                 .pipe(ezs('ISTEXExchange',{ parallel: 20, doLogError:false}))
                 .pipe(ezs.catch(e => {return e;}))
                 .on('error', (err) => {done(err);})
                 .on('data', (data) => {results.push(data)})
                 .on('end', () => {
                   done();
                 })
  }, 600000);

  it('Should build kbart Lines', function(done) {
    const results = [];

    reviewManager.findDocumentsBy({uri: 'ark:/67375/8Q1-32DSDVT8-D'})
                 .pipe(ezs('ISTEXExchange',{ parallel: 20, doLogError:false}))
                 .pipe(ezs('ISTEXToKbart'))
                 .pipe(ezs.catch(e => {return e;}))
                 .on('error', (err) => {done(err);})
                 .on('data', (data) => {results.push(data)})
                 .on('end', () => {
                   assert.equal(results.join(''), expectedResult.toKbart);
                   done();
                 })
  }, 600000);
});


