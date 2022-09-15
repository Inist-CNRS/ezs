import count from './count';
import distinct from './distinct';
import graph from './graph';
import pair from './pair';
import pluck from './pluck';
import keys from './keys';
import maximizing from './maximizing';
import merging from './merging';
import minimizing from './minimizing';
import reducing from './reducing';
import exploding from './exploding';
import summing from './summing';
import groupingByEquality from './groupingByEquality';
import groupingByModulo from './groupingByModulo';
import groupingByLevenshtein from './groupingByLevenshtein';
import groupingByHamming from './groupingByHamming';
import tune from './tune';
import value from './value';
import sort from './sort';
import segment from './segment';
import output from './output';
import slice from './slice';
import distribute from './distribute';
import greater from './greater';
import less from './less';
import drop from './drop';
import filter from './filter';
import multiply from './mulitply';
import distance from './distance';
import aggregate from './aggregate';
import statistics from './statistics';

const funcs = {
    count,
    distinct,
    graph,
    pair,
    pluck,
    keys,
    minimizing,
    maximizing,
    merging,
    reducing,
    exploding,
    summing,
    groupingByEquality,
    groupingByModulo,
    groupingByLevenshtein,
    groupingByHamming,
    tune,
    value,
    sort,
    segment,
    output,
    slice,
    distribute,
    greater,
    less,
    drop,
    filter,
    multiply,
    distance,
    aggregate,
    statistics,
};

export default funcs;

module.exports = funcs;
