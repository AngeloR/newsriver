'use strict';

const Ioredis = require('ioredis');
const redis = Ioredis(process.env.REDIS_URL);

module.exports = redis;
