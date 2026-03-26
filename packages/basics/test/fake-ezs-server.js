import http from 'http';
import fs from 'fs';
import ezs from '../../core/src';

ezs.addPath(__dirname);
ezs.settings.servePath = __dirname;

const PORT = 4444

let httpServer = null;

export function startEZSServer() {
    return new Promise((resolve, reject) => {
        if (httpServer?.listening) return resolve(httpServer);

        httpServer = ezs.createServer(PORT, __dirname);
        httpServer.once('error', reject);
        httpServer.on('listening', () => resolve(httpServer));
    });
}

export function stopEZSServer() {
    return new Promise((resolve, reject) => {
        if (!httpServer?.listening) return resolve();
        httpServer.closeAllConnections();
        try {
            httpServer.close(() => {
                httpServer = null;
                resolve();
            });
        } catch (err) {
            // Serveur déjà arrêté, on ignore l'erreur
            httpServer = null;
            resolve();
        }
    });
}

export function getEZSHost() {
    return `http://localhost:${PORT}`;
}

