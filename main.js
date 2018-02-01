'use strict';

const cluster = require('cluster');
const debug = require('debug')('app');

if(cluster.isMaster) {
    cluster.fork();
    require('./api');
    debug('starting api');
}
else {
    require('./ingest');
    debug('starting ingester');
}
