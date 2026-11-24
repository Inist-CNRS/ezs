import fetch from 'fetch-with-proxy';

// a request for async-retry, which keeps the status and the answer of the
// server in its error, like the one of @ezs/basics
const request = (url, parameters) => async (bail) => {
    const response = await fetch(url, parameters);
    if (!response.ok) {
        const err = new Error(response.statusText);
        err.status = response.status;
        err.responseText = await response.text();
        try {
            err.body = JSON.parse(err.responseText);
        } catch {
            // not a JSON answer: an error page, kept as responseText
        }
        if ([400, 401, 402, 403, 404].includes(response.status)) {
            // useless to retry
            return bail(err);
        }
        throw err;
    }
    return response;
};

export default request;
