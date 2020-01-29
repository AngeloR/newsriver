'use strict';
require('dotenv').config();
const Server = require('./lib/server');
const redis = require('./lib/redis');
const dateUtils = require('./lib/date');
const sources = require('./data/sources.json');
const fs = require('fs');
const debug = require('debug')('app:api');
const path = require('path');
const crypto = require('crypto');
let tagColors = {};

const server = new Server({
    port: process.env.PORT
});

function loadStaticFile(api, req, res) {
    fs.readFile('./public/'+req.url, (err, data) => {
        if(err) {
            debug(err);
            res.statusCode = 500;
            res.end();
            return;
        }

        res.statusCode = 200;
        res.end(data);
    });
}

function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function urlNormalize(rawURL) {
    let url = new URL(rawURL);
    switch(url.host) {
        case 'www.reddit.com':
            let pieces = url.pathname.split('/');
            // piece 0 is an empty string since the path starts with a /
            url.id = url.host + pieces[1] + pieces[2];
            break;
        default:
            url.id = url.host;
            break;
    }

    return url;
}

function calculateColor(rawURL) {
    let url = urlNormalize(rawURL);

    if(!tagColors[url.id]) {
        let hash = crypto.createHash('md5');
        hash.update(url.id);
        let str = hash.digest('hex');
        tagColors[url.id] = str.substr(random(0, str.length - 7), 6);
    }
    return tagColors[url.id];
}

function getTagColor(rawURL) {
    let url = urlNormalize(rawURL);
    return tagColors[url.id];
}

server.get('/$', (api, req, res) => {
    req.url = 'index.html';
    loadStaticFile(api, req, res);
});

server.get('^\/(.*)\.(js|html|css|png)', loadStaticFile);

server.get('/api/v1/sources', (api, req, res) => {
    res.end(JSON.stringify(sources));
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
            let hashes = {};
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
                            items.push(Object.assign({
                                tag_color: getTagColor(res[1].comments)
                            }, res[1]));
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


// before we start the server, we parse the sources.json file 
// to figure out tag colors
function setTagColors() {
    sources.forEach((source, id) => {
        let url = urlNormalize(source.url);
        if(source.tag_color) {
            tagColors[url.id] = source.tag_color;
        }
        else {
            calculateColor(source.url);
            sources[id].tag_color = tagColors[url.id];
        }
    });
}

setTagColors();

server.start();
