'use strict';

const http = require('http');
const debug = require('debug')('app:server');
const url = require('url');
const qs = require('querystring');

class Server {
    constructor(options) {
        this.opts = options;

        this.server = http.createServer(this.handler.bind(this));
    
        this.methods = {};
        ['get','post','delete','put','head', 'options'].forEach(m => {
            this.methods[m] = {};
            this[m] = this.bindHandler.bind(this, m);
        });

        this.options('(.*)', (api, req, res) => {
            res.statusCode = 200;
            res.end();
        });
    }

    bindHandler(method, regex, handler) {
        if(!this.methods[method][regex]) {
            this.methods[method][regex] = {
                regex: new RegExp('^' + regex),
                handlers: []
            };
        }

        this.methods[method][regex].handlers.push(handler);
    }

    handler(req, res) {
        const api = {
            url: url.parse(req.url)
        };

        const regexes = this.methods[req.method.toLowerCase()];

        debug(`Req ${req.method} @ ${api.url.pathname}`);

        // set cors
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');

        Object.keys(regexes).forEach(key => {
            if(regexes[key].regex.test(api.url.path)) {
                regexes[key].handlers.forEach(handler => {
                    handler(api, req, res);
                });
            }
        });
    }

    start(fn) {
        this.server.listen(this.opts.port, () => {
            debug(`Listening on *:${this.opts.port}`);
            if(fn)
                fn();
        });
    }
}

module.exports = Server;
