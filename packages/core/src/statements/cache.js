import { createHash } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import cacache from 'cacache';
import debug from 'debug';
import { pipeline } from 'stream';
import { sha } from './identify.js';

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

function collectExpiredKeys(cachePath, ttlMs) {
    return new Promise((resolve, reject) => {
        const now = Date.now();
        const expiredKeys = [];
        cacache.ls
            .stream(cachePath)
            .on('data', (entry) => {
                if (now - entry.time > ttlMs) {
                    expiredKeys.push(entry.key);
                }
            })
            .on('error', reject)
            .on('end', () => resolve(expiredKeys));
    });
}

export async function cleanupCache(cachePath, ttlMs = DEFAULT_TTL_MS) {
    // On ne garde en mémoire que les clés expirées, pas tout l'index
    const expiredKeys = await collectExpiredKeys(cachePath, ttlMs);

    // Suppression séquentielle : pas de pic de descripteurs de fichiers
    await expiredKeys.reduce(
        (chain, key) => chain.then(() => cacache.rm.entry(cachePath, key)),
        Promise.resolve()
    );

    // rm.entry ne touche que l'index : verify libère le contenu orphelin
    await cacache.verify(cachePath);
}

const lastCleanup = new Map();
const cleanupTimers = new Map();

export function scheduleCleanup(
    cachePath,
    ttlMs = DEFAULT_TTL_MS,
    cleanupIntervalMs = DEFAULT_CLEANUP_INTERVAL_MS
) {
    const now = Date.now();

    if (cleanupTimers.has(cachePath)) {
        return;
    }

    if (now - (lastCleanup.get(cachePath) ?? 0) < cleanupIntervalMs) {
        return;
    }

    lastCleanup.set(cachePath, now);

    const timer = setTimeout(async () => {
        cleanupTimers.delete(cachePath);

        try {
            await cleanupCache(cachePath, ttlMs);
        } catch (error) {
            console.error('Cache cleanup failed', error);
        }
    }, cleanupIntervalMs);

    timer.unref?.();
    cleanupTimers.set(cachePath, timer);
}

export async function cacheGet(cachePath, cacheKey, ttlMs = DEFAULT_TTL_MS) {
    const cacheObject = await cacache.get.info(cachePath, cacheKey);
    if (!cacheObject || Date.now() - cacheObject.time > ttlMs) {
        return null;
    }
    try {
        const data = await cacache.get.byDigest(
            cachePath,
            cacheObject.integrity
        );
        return JSON.parse(data.toString());
    } catch (error) {
        const isCorrupted =
            error instanceof SyntaxError ||
            error.code === 'ENOENT' ||
            error.code === 'EINTEGRITY';
        if (!isCorrupted) {
            throw error;
        }
        // Entrée inutilisable : on la retire pour ne pas la re-parser à chaque lecture
        await cacache.rm.entry(cachePath, cacheKey).catch(() => {});
        return null;
    }
}

export async function cachePut(
    cachePath,
    cacheKey,
    cacheValue,
    ttlMs = DEFAULT_TTL_MS,
    cleanupIntervalMs = DEFAULT_CLEANUP_INTERVAL_MS
) {
    if (cacheValue == null) {
        return false;
    }
    const integrity = await cacache.put(
        cachePath,
        cacheKey,
        JSON.stringify(cacheValue)
    );
    scheduleCleanup(cachePath, ttlMs, cleanupIntervalMs);
    return integrity;
}

/**
 * Renvoie un flux d'objets lu depuis le cache (cacache -> unpack), ou null si absent / expiré.
 */
export async function cacheGetStream(
    ezs,
    cachePath,
    cacheKey,
    ttlMs = DEFAULT_TTL_MS
) {
    const info = await cacache.get.info(cachePath, cacheKey);
    if (!info || Date.now() - info.time > ttlMs) {
        return null;
    }
    if (!(await cacache.get.hasContent(cachePath, info.integrity))) {
        await cacache.rm.entry(cachePath, cacheKey).catch(() => {});
        return null;
    }
    return pipeline(
        cacache.get.stream.byDigest(cachePath, info.integrity),
        ezs('unpack'),
        (error) => {
            if (error) {
                // contenu illisible (ex. EINTEGRITY) : on retire l'entrée, l'erreur remonte au flux
                cacache.rm.entry(cachePath, cacheKey).catch(() => {});
            }
        }
    );
}

/**
 * sous-pipeline exécuté uniqument si il n'est pas en cache
 * - si le résultat est en cache, il est renvoyé en flux sans exécuter le sous-pipeline ;
 * - sinon le sous-pipeline est exécuté, et ses sorties sont écrites dans le cache
 *   au fil de l'eau tout en étant transmises au statement suivant.
 *   Le cache n'est validé qu'à la fin du flux, et seulement s'il n'y a eu aucune erreur.
 *
 * @name cache
 * @param {String} [file] fichier du sous-pipeline
 * @param {String} [script] script du sous-pipeline
 * @param {String} [command] commande du sous-pipeline
 * @param {String} [commands] commandes du sous-pipeline
 * @param {String} [prepend] commandes ajoutées avant
 * @param {String} [append] commandes ajoutées après
 * @param {String} [key] clé de cache (défaut : hash de l'objet + définition du sous-pipeline)
 * @param {String} [location] répertoire du cache (défaut : tmpdir)
 * @param {Number} [ttl=86400000] durée de vie du cache en ms
 * @returns {Object}
 */
export default async function cache(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    const file = this.getParam('file');
    const script = this.getParam('script');
    const command = this.getParam('command');
    const commands = this.getParam('commands');
    const prepend = this.getParam('prepend');
    const append = this.getParam('append');
    const ttl = Number(this.getParam('ttl', 24 * 60 * 60 * 1000));
    const cachePath = join(
        this.getParam('location') || tmpdir(),
        'spawn-cache'
    );

    // La définition du sous-pipeline fait partie de la clé : si le script change, le cache est invalidé
    const key = await sha(this.getParam('key') || data);

    // 1. Cache hit : lecture en flux
    try {
        const cached = await cacheGetStream(ezs, cachePath, key, ttl);
        if (cached) {
            //    debug('ezs:info')(`${key} hit the cache`);
            return await feed.flow(cached);
        }
    } catch (e) {
        debug('ezs:warn')(
            `cache read failed (${key}), sub-pipeline will run`,
            e
        );
    }

    // 2. Cache miss : sous-pipeline, comme spawn
    const statements = ezs.compileCommands(
        ezs.createCommands({
            file,
            script,
            command,
            commands,
            prepend,
            append,
        }),
        this.getEnv()
    );
    const input = ezs.createStream(ezs.objectMode());
    const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());

    // Écriture dans le cache : objets -> pack -> cacache
    const packed = ezs('pack');
    const out = cacache.put.stream(cachePath, key);
    let failed = false;
    const stored = new Promise((resolve) => {
        out.on('finish', resolve);
        out.on('error', (e) => {
            failed = true;
            debug('ezs:warn')(`cache write failed (${key})`, e);
            packed.resume(); // vide le flux pour ne pas bloquer le pipeline
            resolve();
        });
    });
    packed.pipe(out);

    // Intercepte les sorties (après ezs.catch, donc uniquement des données valides)
    const tap = ezs(async (item, tapFeed, ctx) => {
        if (ctx.isLast()) {
            packed.end();
            await stored;
            if (failed) {
                // l'index n'est écrit qu'à la fin du flux : on retire un éventuel résultat partiel
                await cacache.rm.entry(cachePath, key).catch(() => {});
            } else {
                scheduleCleanup(cachePath, ttl);
            }
            return tapFeed.close();
        }
        await new Promise((resolve) => ezs.writeTo(packed, item, resolve));
        return tapFeed.send(item);
    });
    const output = ezs
        .createPipeline(input, statements, logger)
        .pipe(
            ezs.catch((e) => {
                failed = true; // ne jamais valider un résultat partiel
                feed.write(e);
            })
        )
        .pipe(tap);

    ezs.writeTo(input, data, () => input.end());
    return feed.flow(output);
}
