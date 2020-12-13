import nodeFetch from 'node-fetch';
import { getProxyForUrl } from 'proxy-from-env';
import http from 'http';
import https from 'https';
import { Agent } from 'better-https-proxy-agent';

const AgentOptions = {
    keepAlive: true,
    timeout: 1000,
    keepAliveMsecs: 500,
    maxSockets: 20,
    maxFreeSockets: 5,
    maxCachedSessions: 500,
};
const chooseAgent = (parsedURL) => {
    const proxyurl = getProxyForUrl(parsedURL.href);
    if (proxyurl) {
        const proxyRequestOptions = new URL(proxyurl);
        return new Agent(AgentOptions, proxyRequestOptions);
    }
    if (parsedURL.protocol === 'https:') {
        return new https.Agent(AgentOptions);
    }
    return new http.Agent(AgentOptions);
};

export default function fetch(url, options) {
    const opts = options || {};
    let agent = chooseAgent(new URL(url));
    opts.agent = agent;
    if (opts.signal) {
        opts.signal.addEventListener('abort', () => {
            agent.destroy();
            agent = null;
        });
    }
    return nodeFetch(url, options);
}
