'use strict';

const Server = require('./lib/server');
const redis = require('./lib/redis');
const dateUtils = require('./lib/date');
const debug = require('debug')('app:api');

const server = new Server({
    port: process.env.PORT
});

server.get('/api/v1/sources', (api, req, res) => {
    res.end(JSON.stringify(require('./data/sources.json')));
});

server.get('/api/v1/list/since/(.*)', (api, req, res) => {
    const since_date = api.url.pathname.split('/since/')[1];
    // take the date key (based on the key that we define in the db)
    // that we use to figure out which NEXT set of items
    const startDate = dateUtils.bucketToDate(since_date);
    const stopDate = new Date(Date.now());

    const allBucketKeys = dateUtils.bucketDiff(startDate, stopDate).reverse();

    // lets get the ids of items in that time period
    const idPipeline = redis.pipeline();
    allBucketKeys.forEach(bucketKey => {
        idPipeline.smembers(`list:${bucketKey}`);
    });

    idPipeline.exec()
        .then(data => {
            const itemPipeline = redis.pipeline();
            data.forEach(res => {
                // the response here is an array of arrays. We want to
                // extract just the successful ids to build our pipeline
                // query
                if(!res[0]) {
                    res[1].forEach(id => {
                        itemPipeline.hgetall(`item:${id}`);
                    });
                }
            });

            itemPipeline.exec()
                .then(data => {
                    let items = [];
                    data.forEach(res => {
                        if(!res[0]) {
                            items.push(res[1]);
                        }
                    });

                    res.end(JSON.stringify({
                        nextKey: dateUtils.dateToBucketKey(stopDate),
                        items: items
                    }));
                }).catch(e => {
                    debug(e);
                    res.end(e.message);
                });
        }).catch(e => {
            debug(e);
            res.end(e.message);
        });
});

server.start();
