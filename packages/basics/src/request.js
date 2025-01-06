import fetch from 'fetch-with-proxy';

const request = (url, parameters) => async (bail) => {

    const response = await fetch(url, parameters);
    if (!response.ok) { // response.status >= 200 && response.status < 300
        const err = new Error(response.statusText);
        const text = await response.text();
        err.responseText = text;
        if ([400, 401, 402, 403, 404].indexOf(response.status) >= 0) {
            // useless to retry
            return bail(err);
        }
        throw err;
    }
    return response;
};
export default request;
