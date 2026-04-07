const { runInThisContext } = require('vm');

global.AbortController = runInThisContext('AbortController');
global.AbortSignal = runInThisContext('AbortSignal');
global.fetch = runInThisContext('fetch');
