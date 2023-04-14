import TeeftExtractTerms from './extract-terms';
import TeeftFilterMonoFreq from './filter-mono-freq';
import TeeftFilterMultiSpec from './filter-multi-spec';
import TeeftFilterTags from './filter-tags';
import TeeftGetFilesContent from './get-files-content';
import TeeftListFiles from './list-files';
import TeeftNaturalTag from './natural-tag';
import TeeftRemoveLongTerms from './remove-long-terms';
import TeeftRemoveNumbers from './remove-numbers';
import TeeftRemoveShortTerms from './remove-short-terms';
import TeeftRemoveWeirdTerms from './remove-weird-terms';
import TeeftSentenceTokenize from './sentence-tokenize';
import TeeftSpecificity from './specificity';
import TeeftStopWords from './stop-words';
import TeeftSumUpFrequencies from './sum-up-frequencies';
import TeeftTokenize from './tokenize';
import TeeftToLowerCase from './to-lower-case';

const funcs = {
    TeeftExtractTerms,
    TeeftFilterMonoFreq,
    TeeftFilterMultiSpec,
    TeeftFilterTags,
    TeeftGetFilesContent,
    TeeftListFiles,
    TeeftNaturalTag,
    TeeftRemoveLongTerms,
    TeeftRemoveNumbers,
    TeeftRemoveShortTerms,
    TeeftRemoveWeirdTerms,
    TeeftSentenceTokenize,
    TeeftSpecificity,
    TeeftStopWords,
    TeeftSumUpFrequencies,
    TeeftTokenize,
    TeeftToLowerCase,
};

export default funcs;

module.exports = funcs;
