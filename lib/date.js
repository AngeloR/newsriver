'use strict';

/**
 * Convert a bucketKey used for redis access to a Date object
 */
function bucketToDate(bucket) {
    const [date, time] = bucket.split('@');
    const [y,m,d] = date.split('-');
    const [h,min,s] = time.split(':');


    const dateObj = new Date(Date.UTC(y, m, d, h, min, s));

    return dateObj;
}

/**
 * Convert a date object to a bucketKey for redis access
 */
function dateToBucketKey(date) {
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

    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}@${date.getUTCHours()}:${date.getUTCMinutes()}:0`;

    return key;
}

/**
 * Return a list of buckets between two date objects. 
 *
 * This is used to figure out how many bucket increments exist between the 
 * start and end date.
 */
function bucketDiff(startDate, stopDate) {
    const minutes = Math.floor((stopDate.getTime() - startDate.getTime()) / 1000) / 60;

    const increments = minutes/5;

    let dateBuckets = [];
    for(let i = 1; i <= increments; ++i) {
        startDate.setUTCMinutes(startDate.getUTCMinutes() + 5);
        dateBuckets.push(dateToBucketKey(startDate));
    }

    return dateBuckets;
}

exports.bucketToDate = bucketToDate;
exports.dateToBucketKey = dateToBucketKey;
exports.bucketDiff = bucketDiff;
