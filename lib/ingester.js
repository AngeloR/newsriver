'use strict';

const request = require('request');
const { EventEmitter } = require('events');

/**
 * Base Ingester class that all ingestion parsers should extend
 */
class Ingester extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.redis = options.redis;
        this.source = options.source;
    }

    /**
     * Polls the source URL and hands off the response on a 200 to the "parser"
     * method
     */
    start() {
        request(this.source.url, (e, res, data) => {
            if(e) {
                this.emit('error', e);
                return;
            }

            if(res.statusCode !== 200) {
                this.emit('error', data);
                return;
            }

            this.parser(data);
        });
    }

    /**
     * Create a hash of items where the key is a 5minute bucket
     * of keys. This allows us to do incremental queries for items 
     * that fall within a particular bucket
     *
     * @param [Item,Item,...n]
     */
    bucket(items) {
        let buckets = {};
        items.forEach(item => {
            let date = new Date(item.create_date);
            let min = date.getUTCMinutes();
            const diff = min % 5;

            if(diff > 2) {
                min += diff;
            }
            else if(diff > 0 && diff < 3) {
                min -= diff;
            }

            date.setUTCMinutes(min);
            date.setUTCSeconds(0);

            const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}@${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;

            if(!buckets[key]) {
                buckets[key] = [];
            }

            buckets[key].push(item);
        });

        return buckets;
    }

    /**
     * Takes the items, converts them to buckets, and then saves them to redis
     *
     * @param items array An array of Item objects
     */
    save(items) {
        const pipeline = this.redis.pipeline();
        const buckets = this.bucket(items);

        // At this point we want to save each bucket is
        // list:$bucket-key = {item, item2, ...n}
        // and save each item as
        // item:$key = {}
        Object.keys(buckets).forEach(key => {
            // expire any items in 3 days
            pipeline.sadd(`list:${key}`, buckets[key].map(i => i.id));
            pipeline.expire(`list:${key}`, 60 * 60 * 24 * 3);
            buckets[key].forEach(item => {
                pipeline.hmset(`item:${item.id}`, item.json());

                // expire any items in 3 days
                pipeline.expire(`item:${item.id}`, 60 * 60 * 24 * 3) 
            });
        });

        pipeline.exec()
            .then((out) => {
                let err = false;
                out.forEach(res => {
                    if(res[0]) {
                        err = true;
                        this.emit('error', res[0]);
                    }
                });

                if(!err) {
                    this.emit('done');
                }
            }).catch(e => {
                this.emit('error', e);
            })
    }
}

module.exports = Ingester;
