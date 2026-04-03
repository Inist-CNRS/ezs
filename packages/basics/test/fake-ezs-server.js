import http from 'http';
import fs from 'fs';
import ezs from '../../core/src';

ezs.addPath(__dirname);
ezs.settings.servePath = __dirname;

const PORT = 4444

const httpServer = [];

export function startEZSServer(seed = 0) {
    return new Promise((resolve, reject) => {
        if (httpServer[seed]?.listening) return resolve(httpServer[seed]);

        httpServer[seed] = ezs.createServer(PORT + seed, __dirname);
        httpServer[seed].once('error', reject);
        httpServer[seed].on('listening', () => resolve(httpServer[seed]));
    });
}

export function stopEZSServer(seed = 0) {
    return new Promise((resolve, reject) => {
        if (!httpServer[seed]?.listening) return resolve();
        httpServer[seed].closeAllConnections();
        try {
            httpServer[seed].close(() => {
                httpServer[seed] = null;
                resolve();
            });
        } catch (err) {
            // Serveur déjà arrêté, on ignore l'erreur
            httpServer[seed] = null;
            resolve();
        }
    });
}

export function getEZSHost(seed = 0) {
    return `http://localhost:${PORT + seed}`;
}

