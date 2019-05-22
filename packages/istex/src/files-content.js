import fetch from 'fetch-with-proxy';
import getStream from 'get-stream';

/**
 * Take an Object with ISTEX `source` and check the document's file.
 * Warning: to access fulltext, you have to give a `token` parameter.
 * ISTEXFetch produces the stream you need to save the file.
 *
 * @name ISTEXFilesContent
 * @see ISTEXFiles
 * @param {string} [sid="ezs-istex"]  User-agent identifier
 * @param {string} [token]   authentication token (see [documentation](https://doc.istex.fr/api/access/fede.html#acc%C3%A8s-programmatique-via-un-token-didentification))
 * @returns {Object}
 */
function ISTEXFilesContent(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const sid = this.getParam('sid', 'ezs-istex');
    const token = this.getParam('token');
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (!data.source) {
        throw new Error(
            '[ISTEXFiles] should be defined'
            + ' before this statement.',
        );
    }
    const options = {
        headers,
        sid,
        redirect: 'manual',
    };
    fetch(data.source, options).then((response) => {
        if (response.ok) {
            return getStream.buffer(response.body);
        }
        return Promise.reject(new Error('Non-existing file'));
    }).then(content => feed.send({
        ...data,
        content,
    })).catch(() => feed.end());
}

export default {
    ISTEXFilesContent,
};
