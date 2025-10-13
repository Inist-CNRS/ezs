import { tmpdir } from 'os';
import { join } from 'path';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import LRU from 'lru-cache';
import Database from 'better-sqlite3';

class AbstractStore {
    constructor(ezs, dbPath) {
        this.ezs = ezs;
        this.dbPath = dbPath;

        // Initialize SQLite database
        this.db = new Database(join(dbPath, 'store.db'));

        // Initialize schema
        const schema = `
            CREATE TABLE IF NOT EXISTS store_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL UNIQUE,
                value TEXT NOT NULL,
                score INTEGER DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_store_entries_key ON store_entries(key);
            CREATE INDEX IF NOT EXISTS idx_store_entries_score ON store_entries(score);

            CREATE TRIGGER IF NOT EXISTS update_store_entries_timestamp
                AFTER UPDATE ON store_entries
            BEGIN
                UPDATE store_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
        `;
        this.db.exec(schema);

        // Prepare statements for better performance
        this.getStmt = this.db.prepare('SELECT value FROM store_entries WHERE key = ?');
        this.putStmt = this.db.prepare('INSERT OR REPLACE INTO store_entries (key, value, score) VALUES (?, ?, ?)');
        this.putWithScoreCheckStmt = this.db.prepare('SELECT score FROM store_entries WHERE key = ?');
        this.getAllStmt = this.db.prepare('SELECT key, value FROM store_entries ORDER BY id');
        this.deleteAllStmt = this.db.prepare('DELETE FROM store_entries');

        // Initialize LRU cache if enabled
        if (ezs.settings.cacheEnable) {
            this.cache = new LRU(ezs.settings.cache);
        } else {
            this.cache = false;
        }
    }

    get(key) {
        const k = JSON.stringify(key);

        // Check cache first if enabled
        if (this.cache && typeof this.cache === 'object' && 'get' in this.cache) {
            const cached = this.cache.get(k);
            if (cached) {
                return Promise.resolve(JSON.parse(cached));
            }
        }

        try {
            const row = this.getStmt.get(k);
            if (!row) {
                throw new Error(`Key not found: ${k}`);
            }

            const value = JSON.parse(row.value);

            // Cache the result if caching is enabled
            if (this.cache && typeof this.cache === 'object' && 'set' in this.cache) {
                this.cache.set(k, row.value);
            }

            return Promise.resolve(value);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async put(key, value, score) {
        const k = JSON.stringify(key);
        const v = JSON.stringify(value);

        try {
            if (!score) {
                // Simple put without score checking
                this.putStmt.run(k, v, null);

                // Update cache if enabled
                if (this.cache && typeof this.cache === 'object' && 'set' in this.cache) {
                    this.cache.set(k, v);
                }

                return Promise.resolve(true);
            }

            // Check existing score if score is provided
            const existing = this.putWithScoreCheckStmt.get(k);
            if (!existing || !existing.score || existing.score < score) {
                this.putStmt.run(k, v, score);

                // Update cache if enabled
                if (this.cache && typeof this.cache === 'object' && 'set' in this.cache) {
                    this.cache.set(k, v);
                }

                return Promise.resolve(true);
            }

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    stream() {
        return this.cast();
    }

    empty() {
        return this.cast().pipe(this.ezs(async (data, feed, ctx) => {
            if (ctx.isLast()) {
                await this.reset();
                return feed.close();
            }
            return feed.send(data);
        }));
    }

    cast() {
        const { Readable } = require('stream');

        // Create a readable stream that emits all entries
        const readable = new Readable({ objectMode: true });

        let rows;
        try {
            rows = this.getAllStmt.all();
        } catch (error) {
            readable.destroy(error);
            return readable;
        }

        let index = 0;

        readable._read = () => {
            if (index < rows.length) {
                const row = rows[index++];
                try {
                    const entry = {
                        id: JSON.parse(row.key),
                        value: JSON.parse(row.value),
                    };
                    readable.push(entry);
                } catch (e) {
                    readable.destroy(e);
                }
            } else {
                readable.push(null); // End of stream
            }
        };

        return readable.pipe(this.ezs(async (data, feed, ctx) => {
            if (ctx.isLast()) {
                return feed.close();
            }
            return feed.send(data);
        }));
    }

    reset() {
        try {
            this.deleteAllStmt.run();

            // Clear cache if enabled
            if (this.cache && typeof this.cache === 'object' && 'reset' in this.cache) {
                this.cache.reset();
            }

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    close() {
        try {
            if (this.db) {
                this.db.close();
                this.db = null;
            }
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default async function store(ezs, domain, location) {

    const path = join(location || tmpdir(), 'db', domain);
    if (!pathExists.sync(path)) {
        makeDir.sync(path);
    }
    return new AbstractStore(ezs, path);
}
