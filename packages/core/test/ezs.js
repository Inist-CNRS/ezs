/*jshint node:true,laxcomma:true*/
/*global describe,it */
'use strict';
const assert = require('assert')
  , ezs = require('..');

const Read = require('stream').Readable
class Decade extends Read {
  constructor (max) {
    super( { objectMode: true })
    this.i = 0
  }
  _read() {
    this.i += 1
    if (this.i >= 10) {
      this.push(null)
    }
    else {
      this.push(this.i)
    }
  }
}



describe('Build a pipeline', function () {
  it('with no transformation', function(done) {
    let res = 0;
    let ten = new Decade();
    ten
      .pipe(ezs(function(input, output) {
        output.send(input);
      }))
      .on('data', (chunk) => {
        res += chunk;
      })
      .on('end', () => {
        assert.strictEqual(res, 45)
        done();
      })
  });

  it('with transformation', function(done) {
    let res = 0;
    let ten = new Decade();
    ten
      .pipe(ezs(function(input, output) {
        output.send(input + 1);
      }))
      .on('data', (chunk) => {
        res += chunk;
      })
      .on('end', () => {
        assert.strictEqual(res, 55)
        done();
      })
  });
  it('with explosion', function(done) {
    let res = 0;
    let ten = new Decade();
    ten
      .pipe(ezs(function(input, output) {
        for(let i = 0; i < input; i++) {
          output.write(i);
        }
        output.end();
      }))
      .on('data', (chunk) => {
        res += chunk;
      })
      .on('end', () => {
        assert.strictEqual(res, 120)
        done();
      })
  });

});

