import dir from 'node-dir';
import loadJsonFile from 'load-json-file';
import pathExists from 'path-exists';
import autocast from 'autocast';
import { dirname, resolve as pathResolve } from 'path';
import _ from 'lodash';
import settings from '../settings';
import {
    VERSION, STARTED_AT,
} from '../constants';

const keyOfPathItemObject = [ // https://swagger.io/specification/
    '$ref',
    'summary',
    'description',
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
    'trace',
    'servers',
    'parameters',
];
const collectMetadata = async (dirPath, hostName) => {
    const globalSwagger = {
        openapi: '3.0.0',
        info: {
            title: settings.title,
            description: settings.description,
            version: VERSION,
            'x-encoding': {
                value: settings.encoding,
                description: 'Server communication through a specific encoding.',
            },
            'x-concurrency': {
                value: settings.concurrency,
                description: 'Number of tasks processed in parallel',
            },
            'x-shards': {
                value: settings.highWaterMark.object,
                description: 'Number of items grouped for processing.',
            },
            'x-uptime': {
                value: Date.now() - STARTED_AT,
                description: 'Server running since (seconds).',
            },
            'x-timestamp': {
                value: Date.now(),
                description: 'Infos generate at (timestamp).',
            },
            'x-daemon': {
                value: (dirPath !== false),
                description: 'Webservice mode.',
            },
            'x-slave': {
                value: (dirPath === false),
                description: 'RPC mode.',
            },
            'x-cache': {
                value: settings.cacheEnable,
                description: 'Read files and calculate parameters only once.',
            },
        },
        servers: [
            {
                url: '{scheme}://{hostname}/',
                description: 'EZS server',
                variables: {
                    scheme: {
                        description: 'Webservices are accessible via https and/or http',
                        enum: [
                            'https',
                            'http',
                        ],
                        default: 'http',
                    },
                    hostname: {
                        description: 'Webservices are accessible via various network interfaces',
                        default: hostName,
                    },
                },
            },
        ],
        tags: [
            {
                name: 'EZS',
                description: 'NodeJS streaming processing system',
                externalDocs: {
                    description: 'Documentation',
                    url: 'https://inist-cnrs.github.io/ezs/',
                },
            },
            {
                name: 'EZS/Plugins',
                description: 'List available plugins',
                externalDocs: {
                    description: 'NPM Regsitry',
                    url: 'https://www.npmjs.com/search?q=keywords:ezs',
                },
            },
        ],
        components: {
            schemas: {
                anyValue: {
                    description: 'Any value: string, object, array, number, etc.',
                    example: '...',
                    format: 'text/plain',
                },
                JSONStream: {
                    type: 'array',
                    items: {
                        $ref: '#/components/schemas/anyValue',
                    },
                },
            },
        },
    };
    const swaggerFile = pathResolve(dirPath, 'swagger.json');
    try {
        if (await pathExists(swaggerFile)) {
            const localSwagger = await loadJsonFile(swaggerFile);
            return _.merge(globalSwagger, localSwagger);
        }
    }
    catch(e) {
        return globalSwagger;
    }
    return globalSwagger;
}
const collectPaths = (ezs, dirPath) => new Promise((resolve) => {
    if (!dirPath) {
        return resolve({});
    }
    dir.files(dirPath, (err, files) => {
        const filenames = err ? [] : files;
        const paths = filenames
            .filter((f) => (f.search(/\.(ini|ezs)$/) > 0))
            .map((f) => ({
                [f.replace(dirPath, '').replace(/\.\w+/, '')]:
                _.reduce(
                    ezs.metaFile(f),
                    (object, value, key) => _.set(
                        _.pick(
                            _.set(object, key, autocast(value)),
                            keyOfPathItemObject,
                        ),
                        'post.x-config-filename',
                        f.replace(dirname(dirPath), ''),
                    ),
                    {},
                ),
            })).reduce(
                (obj, cur) => ({
                    ...obj,
                    ...cur,
                }), {},
            );
        resolve(paths);
    });
});

const serverInformation =  (ezs, serverPath) => async (request, response) => {
    const infos = await collectMetadata(serverPath, request.headers.host);
    const paths = await collectPaths(ezs, serverPath);
    const swagger = {
        ...infos,
        paths,
    };
    const responseBody = JSON.stringify(swagger);
    const responseHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(responseBody),
    };
    response.writeHead(200, responseHeaders);
    response.write(responseBody);
    response.end();
};

export default serverInformation;
