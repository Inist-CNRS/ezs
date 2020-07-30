import dir from 'node-dir';
import { dirname } from 'path';
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
const getInformations = (ezs, dirPath, hostName) => new Promise((resolve) => {
    const infos = {
        openapi: '3.0.0',
        info: {
            description: 'You can consume and/or generate data from many various ways.',
            version: VERSION,
            title: 'EZS Web Services',
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
    if (!dirPath) {
        return resolve(infos);
    }
    return dir.files(dirPath, (err, files) => {
        const filenames = err ? [] : files;
        const paths = filenames
            .filter((f) => (f.search(/\.(ini|ezs)$/) > 0))
            .map((f) => ({
                [f.replace(dirPath, '').replace(/\.\w+/, '')]:
                _.reduce(
                    ezs.metaFile(f),
                    (object, value, key) => _.set(
                        _.pick(
                            _.set(object, key, value),
                            keyOfPathItemObject,
                        ),
                        'post.x-filename',
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
        return resolve({
            ...infos,
            paths,
        });
    });
});

const serverInformation = (ezs, serverPath) => (request, response) => {
    getInformations(ezs, serverPath, request.headers.host)
        .then((informations) => {
            const responseBody = JSON.stringify(informations);
            const responseHeaders = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(responseBody),
            };
            response.writeHead(200, responseHeaders);
            response.write(responseBody);
            response.end();
        });
};

export default serverInformation;
