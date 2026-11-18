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
        const err =
            raw instanceof Error
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
    if (!response.ok) {
        // response.status >= 200 && response.status < 300
        const err = new Error(response.statusText);
        const text = await response.text();
        err.status = response.status;
        err.responseText = text;
        if ([400, 401, 402, 403, 404].indexOf(response.status) >= 0) {
            // useless to retry
            return bail(err);
        }
        throw err;
    }
    return response;
};
export const convertError = (e) => {
    let err = e;
    while (err.cause) err = err.cause;
    const message =
        e != err
            ? `${e.message} : ${err.message} ${err.code || ''}`
            : `${e.message} ${e.code || ''}`;
    const standardError = new Error(message.trim());
    // the status and the answer of the server explain the error
    const status = e.status || err.status;
    const responseText = e.responseText || err.responseText;
    if (status) {
        standardError.status = status;
    }
    if (responseText) {
        standardError.responseText = responseText;
    }
    return standardError;
};
export default request;
