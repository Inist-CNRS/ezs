import fetch from 'fetch-with-proxy';

const request = (url, parameters) => async () => {
    const response = await fetch(url, parameters);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response;
};
export default request;
