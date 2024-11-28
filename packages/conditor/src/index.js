import affAlign from './affAlign';
import compareRnsr from './compareRnsr';
import conditorScroll from './scroll';
import getRnsr from './getRnsr';
import getRnsrInfo from './getRnsrInfo';
import CORHALFetch from './corhal-fetch';
import WOSFetch from './wos-fetch';
import OAFetch from './openalex-fetch';

const funcs = {
    affAlign,
    compareRnsr,
    conditorScroll,
    getRnsr,
    getRnsrInfo,
    CORHALFetch,
    WOSFetch,
    OAFetch,
};

export default funcs;

module.exports = funcs;
