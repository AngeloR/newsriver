'use strict';

const cluster = require('cluster');

if(cluster.isMaster) {
    // in the master process we start the api
    cluster.fork();
    require('./api');
    console.log('starting api');
}
else {
    require('./ingest');
    console.log('starting ingester');
}
