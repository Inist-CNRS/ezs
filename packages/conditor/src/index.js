import affAlign from './affAlign';
import compareRnsr from './compareRnsr';
import conditorScroll from './scroll';
import getRnsr from './getRnsr';
import getRnsrInfo from './getRnsrInfo';
import CORHALFetch from './corhal-fetch';
import WOSFetch from './wos-fetch';

const funcs = {
    affAlign,
    compareRnsr,
    conditorScroll,
    getRnsr,
    getRnsrInfo,
    CORHALFetch,
    WOSFetch,
};

export default funcs;

module.exports = funcs;
