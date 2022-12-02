import fetch from 'fetch-with-proxy';

const request = (url, parameters) => async () => {

    const response = await fetch(url, parameters);

    if (!response.ok) {
        const err = new Error(response.statusText);
        const text = await response.text();
        err.responseText = text;
        throw err;
    }
    return response;
};
export default request;
