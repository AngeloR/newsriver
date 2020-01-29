'use strct';

require('dotenv').config();
const debug = require('debug')('app:ingest');
const Sources = require('./data/sources.json');
const redis = require('./lib/redis');

function errorHandler(e) {
    debug(e);
}

function parserComplete(parser) {
    debug(`${parser.name} for ${parser.source.title} Complete @ ${new Date()}`);
    setTimeout(() => {
        parser.start();
    }, 1000 * 60 * 5);
}

Sources.forEach(source => {
    try {
        const Parser = require(`./parser/${source.parser}`);
        const parser = new Parser({
            source: source,
            redis: redis
        });

        parser.on('error', errorHandler);
        parser.on('done', () => {
            parserComplete(parser);
        });

        parser.start();
    }
    catch(e) {
        debug(e);
    }
})
