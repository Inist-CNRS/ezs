import expectedResult from "./data/exchangeExpectedResult";
import data from "./data/exchangeData";

import ezs from "../../core/src";
// import {reviewManager} from "istex-exchange";

import assert from "assert";
import nock from "nock";
import hl from 'highland';

ezs.use(require("../src"));
ezs.use(require("../../basics/src"));

describe.skip("Istex-exchange", function() {

  it("Should build kbart Lines", function(done) {
    const results = [];
    nock("https://api.istex.fr")
      .get(
        "/document?q=corpusName%3A%22iop%22+AND+%28host.issn%3A%220959-5309%22+OR+host.eissn%3A%222051-2171%22+OR+host.title.raw%3A%22Proceedings+of+the+Physical+Society%22%29&size=0&output=&facet=host.volume%5B*-*%3A1%5D%3Ehost.publicationDate%5B*-*%3A1%5D%2Chost.issue%5B*-*%3A1%5D%3Ehost.publicationDate%5B*-*%3A1%5D&sid=istex-exchange")
      .reply(200,
             data["https://api.istex.fr/document?q=corpusName%3A%22iop%22+AND+%28host.issn%3A%220959-5309%22+OR+host.eissn%3A%222051-2171%22+OR+host.title.raw%3A%22Proceedings+of+the+Physical+Society%22%29&size=0&output=&facet=host.volume%5B*-*%3A1%5D%3Ehost.publicationDate%5B*-*%3A1%5D%2Chost.issue%5B*-*%3A1%5D%3Ehost.publicationDate%5B*-*%3A1%5D&sid=istex-exchange"])
      .get(
        "/document?q=corpusName%3A%22iop%22+AND+%28host.issn%3A%220959-5309%22+OR+host.eissn%3A%222051-2171%22+OR+host.title.raw%3A%22Proceedings+of+the+Physical+Society%22%29&size=1&output=host%2CpublicationDate%2Cauthor&facet=host.volume%5B*-*%3A1%5D%3Ehost.issue%5B*-*%3A1%5D&sid=istex-exchange")
      .reply(200,
             data["https://api.istex.fr/document?q=corpusName%3A%22iop%22+AND+%28host.issn%3A%220959-5309%22+OR+host.eissn%3A%222051-2171%22+OR+host.title.raw%3A%22Proceedings+of+the+Physical+Society%22%29&size=1&output=host%2CpublicationDate%2Cauthor&facet=host.volume%5B*-*%3A1%5D%3Ehost.issue%5B*-*%3A1%5D&sid=istex-exchange"])
      .get(
        "/document?q=corpusName%3A%22iop%22+AND+%28host.issn%3A%220959-5309%22+OR+host.eissn%3A%222051-2171%22+OR+host.title.raw%3A%22Proceedings+of+the+Physical+Society%22%29&size=0&output=&facet=host.volume%5B*-*%3A1%5D%3EpublicationDate%5B*-*%3A1%5D%2Chost.issue%5B*-*%3A1%5D%3EpublicationDate%5B*-*%3A1%5D&sid=istex-exchange")
      .reply(200,
             data["https://api.istex.fr/document?q=corpusName%3A%22iop%22+AND+%28host.issn%3A%220959-5309%22+OR+host.eissn%3A%222051-2171%22+OR+host.title.raw%3A%22Proceedings+of+the+Physical+Society%22%29&size=0&output=&facet=host.volume%5B*-*%3A1%5D%3EpublicationDate%5B*-*%3A1%5D%2Chost.issue%5B*-*%3A1%5D%3EpublicationDate%5B*-*%3A1%5D&sid=istex-exchange"])
      .persist(false)
    ;


    hl([data["ark:/67375/8Q1-4TBMBVTV-C"]])
      .pipe(ezs("ISTEXExchange", {parallel: 20, doWarn: false, doLogError: false}))
      .pipe(ezs("ISTEXToKbart"))
      .pipe(ezs.catch(e => {return e;}))
      .on("error", (err) => {done(err);})
      .on("data", (data) => {results.push(data);})
      .on("end", () => {
        assert.equal(results.join(""), expectedResult.toKbart);
        done();
      });
  }, 600000);

  it("Should compute basics Kbart frame even with no results", function(done) {
    const results = [];
    nock("https://api.istex.fr")
      .get(
        "/document?q=corpusName%3A%22eebo%22+AND+title%3A%22The+image+of+both+churches+%3A+after+the+moste+wonderful+and+heauenly+Reuelacion+of+Sainct+Iohn+the+Euangelist%2C+contayning+a+very+frutefull+exposicion+or+pharaphrase+vpon+the+same%2C+wherin+it+is+conferred+with+the+other+scripturs%2C+and+most+auctorised+historyes.+Compiled+by+Iohn+Bale+an+exlie+also+in+this+life+for+the+faythfull+testimonie+of+Iesu%22&size=1&output=host%2CpublicationDate%2Cauthor&facet=host.volume%5B*-*%3A1%5D%3Ehost.issue%5B*-*%3A1%5D&sid=istex-exchange")
      .reply(200,
             data["https://api.istex.fr/document?q=corpusName%3A%22eebo%22+AND+title%3A%22The+image+of+both+churches+%3A+after+the+moste+wonderful+and+heauenly+Reuelacion+of+Sainct+Iohn+the+Euangelist%2C+contayning+a+very+frutefull+exposicion+or+pharaphrase+vpon+the+same%2C+wherin+it+is+conferred+with+the+other+scripturs%2C+and+most+auctorised+historyes.+Compiled+by+Iohn+Bale+an+exlie+also+in+this+life+for+the+faythfull+testimonie+of+Iesu%22&size=1&output=host%2CpublicationDate%2Cauthor&facet=host.volume%5B*-*%3A1%5D%3Ehost.issue%5B*-*%3A1%5D&sid=istex-exchange"])
      .persist(false)
    ;

    hl([data["ark:/67375/8Q1-7MBQK4LN-J"]])
      .pipe(ezs("ISTEXExchange", {parallel: 20, doWarn: false, doLogError: false}))
      .pipe(ezs("ISTEXToKbart"))
      .pipe(ezs.catch(e => {return e;}))
      .on("error", (err) => {done(err);})
      .on("data", (data) => {results.push(data);})
      .on("end", () => {
        assert.equal(results.join(""), expectedResult.emptyKbart);
        done();
      });
  }, 600000);
});


