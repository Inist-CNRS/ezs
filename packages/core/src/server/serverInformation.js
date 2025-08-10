import debug from 'debug';
import { fdir as FileScan } from 'fdir';
import loadJsonFile from 'load-json-file';
import pathExists from 'path-exists';
import autocast from 'autocast';
import { dirname, resolve as pathResolve } from 'path';
import _ from 'lodash';
import settings from '../settings.js';
import {
    VERSION, STARTED_AT,
} from '../constants.js';

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
const globalSwaggerPaths = {
    '/': {
        'delete': {
            description: 'Cancel asynchronous requests',
            summary: 'A way to cancel too long request.'
        },
        requestBody: {
            description: '',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/serverControl'
                    }
                }
            },
            required: true
        },
        responses: {
            '202': {
                description: 'successful operation',
            },
            '400': {
                description: 'Invalid input value',
            }
        }
    }
};


const collectMetadata = async (ezs, dirPath, hostName) => {
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
                        default: 'https',
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
                    format: 'text/plain',
                    example: 'string or object or array o number, etc.'
                },
                minimalObject: {
                    description: 'at least one field named value',
                    type: 'object',
                    properties: {
                        value: {
                            $ref: '#/components/schemas/anyValue'
                        }
                    }
                },
                JSONStream: {
                    type: 'array',
                    items: {
                        $ref: '#/components/schemas/minimalObject'
                    }
                },
                serverControl: {
                    type: 'object',
                    properties: {
                        'x-request-id': {
                            description: 'Request identifier sent in the http response header.',
                            type: 'string',
                            example: 'qdrfgtyhbvdeftgh'
                        }
                    }
                }
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
        debug('ezs:warn')('Unable to load swagger.json', ezs.serializeError(e));
        return globalSwagger;
    }
    return globalSwagger;
};

const collectPaths = async (ezs, dirPath) => {
    const files = await new FileScan()
        .withBasePath()
        .withFullPaths()
        .exclude((dirName) =>
            dirName.startsWith('.') || dirName.startsWith('~')
        )
        .globWithOptions([
            './**/*.ini',
            './**/*.ezs',
        ], {
            ignore: [
                './**/~*.*',
                './**/$*.*',
            ]
        })
        .crawl(dirPath)
        .withPromise();
    const localPaths = files
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
    return _.merge(globalSwaggerPaths, localPaths);
};

const collectAll = async (ezs, request) => {
    const infos = await collectMetadata(ezs, request.serverPath, request.headers.host);
    const paths = await collectPaths(ezs, request.serverPath);
    return ({ infos, paths });
};

const serverInformation =  (ezs) => (request, response, next) => {
    if (!request.methodMatch(['GET', 'OPTIONS', 'HEAD']) || request.pathName !== '/') {
        return next();
    }
    request.catched = true;
    debug('ezs:info')(`Create middleware 'serverInformation' for ${request.method} ${request.pathName}`);

    return collectAll(ezs, request)
        .then(({ infos, paths }) => {
            const swagger = {
                ...infos,
                paths,
            };
            const responseBody = JSON.stringify(swagger);
            const responseHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': '*',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(responseBody),
            };
            response.writeHead(200, responseHeaders);
            response.write(responseBody);
            response.end();
            return next();
        }).catch(next);
};

export default serverInformation;
