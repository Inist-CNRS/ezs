const request = (url, parameters) => async (bail) => {
    const hasBody = parameters.body !== undefined;
    let response;
    try {
        response = await fetch(url, {
            ...parameters,
            ...(hasBody && { duplex: 'half' }),
        });
    } catch (raw) {
        // Normalise l'erreur quelle que soit la source (undici, DOMException, etc.)
        const err = raw instanceof Error
            ? raw
            : Object.assign(new Error(raw?.message ?? String(raw)), {
                name: raw?.name ?? 'FetchError',
                cause: raw,
            });
        if (err.name === 'AbortError' || err.name === 'TimeoutError') {
            return bail(err);
        }
        throw err;
    }
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
