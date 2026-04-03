import http from 'http';
import fs from 'fs';
import ezs from '../../core/src';

ezs.addPath(__dirname);
ezs.settings.servePath = __dirname;

const PORT = 3333;

const httpServer = [];
const timeoutID1 = [];
const counter1 = [];
const counter2 = [];


function pause(data, feed) {
    const time2sleep = Number(this.getParam('time', 1000));
    if (this.isLast()) {
        feed.close();
    }
    feed.write(data);
    return setTimeout(() => feed.end(), time2sleep);
}



export function startServer(seed = 0) {
    return new Promise((resolve, reject) => {
        if (httpServer[seed]?.listening) return resolve(httpServer[seed]);

        counter1[seed] = 0;
        counter2[seed] = 0;
        httpServer[seed] = http.createServer((req, res) => {
            const { url, method } = req;

            // GET /get?a=*
            if (method === 'GET' && url.startsWith('/get?a=')) {
                const value = new URLSearchParams(url.split('?')[1]).get('a');
                // /get?a=d retourne un tableau fixe
                if (value === 'd') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify([
                        { args: { a: 'a' } },
                        { args: { a: 'b' } },
                    ]));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ args: { a: value } }));
            }

            // POST /post/1 et /post/2 — renvoie le body reçu
            if (method === 'POST' && (url === '/post/1' || url === '/post/2')) {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(body);
                });
                return;
            }

            // Statuts d'erreur GET + POST
            const statusRoutes = [400, 503, 404];
            for (const code of statusRoutes) {
                if (url === `/status/${code}` && (method === 'GET' || method === 'POST')) {
                    res.writeHead(code);
                    return res.end();
                }
            }
            if (method === 'GET' && url === '/-/v1/search?text=ezs') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ total: 23 }));
            }
            // GET /-/v1/search?text=ezs
            if (method === 'GET' && url === '/-/v1/search?text=ezs') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ total: 23 }));
            }

            // GET /-/v1/search?text=nested
            if (method === 'GET' && url === '/-/v1/search?text=nested') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ result: { total: 23 } }));
            }

            // GET /-/v1/search?text=noresult
            if (method === 'GET' && url === '/-/v1/search?text=noresult') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ total: 0 }));
            }

            // GET /-/v1/search?text=empty
            if (method === 'GET' && url === '/-/v1/search?text=empty') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({}));
            }

            // GET /-/v1/search?text=ten
            if (method === 'GET' && url === '/-/v1/search?text=ten') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ total: 10 }));
            }

            // GET /-/v1/search?text=timeout (délai de 1000ms)
            if (method === 'GET' && url === '/-/v1/search?text=timeout') {
                timeoutID1[seed] = setTimeout(() => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ total: 10 }));
                }, 10000);
                return;
            }

            if (method === 'POST' && url === '/timer') {
                if (req.headers['x-timeout'] === 'erratic') {
                    counter2[seed] += 1;
                    if (counter2[seed] % 2 === 0) {
                        res.writeHead(500);
                        return res.end();
                    }
                }
                res.writeHead(200);
                if (req.headers['x-timeout'] === 'all') {
                    const timeoutHandle = setTimeout(() => {
                        req.pipe(res);
                    }, 1000);
                    res.on('close', () => clearTimeout(timeoutHandle));
                    return req;
                }
                if (req.headers['x-timeout'] === 'none') {
                    return req.pipe(res);
                }
                if (req.headers['x-timeout'] === 'once') {
                    counter1[seed] += 1;
                    if (counter1[seed] === 1) {
                        const timeoutHandle = setTimeout(() => {
                            req.pipe(res);
                        }, 1000);
                        res.on('close', () => clearTimeout(timeoutHandle));
                    } else {
                        return req.pipe(res);
                    }
                }
                if (req.headers['x-timeout'] === 'slow') {
                    return req.pipe(ezs(pause)).pipe(res);
                }
                return req.pipe(res);
            }

            res.writeHead(404);
            res.end();
        });

        httpServer[seed].once('error', reject);
        httpServer[seed].listen(PORT + seed, () => resolve(httpServer[seed]));
    });
}

export function stopServer(seed = 0) {
    clearTimeout(timeoutID1[seed]);
    return new Promise((resolve, reject) => {
        if (!httpServer[seed]?.listening) return resolve();
        httpServer[seed].closeAllConnections();
        try {
            httpServer[seed].close(() => {
                httpServer[seed] = null;
                counter1[seed] = 0;
                counter2[seed] = 0;
                resolve();
            });
        } catch (err) {
            // Serveur déjà arrêté, on ignore l'erreur
            httpServer[seed] = null;
            counter1[seed] = 0;
            counter2[seed] = 0;
            resolve();
        }
    });
}

export function getHost(seed = 0) {
    return `http://localhost:${PORT + seed}`;
}

