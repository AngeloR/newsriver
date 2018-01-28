'use strct';

const { expect } = require('chai');
const lib = require('../lib/date');

describe('date-utils', () => {
    describe('bucketToDate', () => {
        it('converts a bucket key to a date', () => {
            const bucketKey = '2018-0-12@15:5:0';

            let date = lib.bucketToDate(bucketKey);

            expect(date.getUTCFullYear()).to.equal(2018);
            expect(date.getUTCMonth()).to.equal(0);
            expect(date.getUTCDate()).to.equal(12);

            expect(date.getUTCHours()).to.equal(15);
            expect(date.getUTCMinutes()).to.equal(5);
            expect(date.getUTCSeconds()).to.equal(0);
        });
    });

    describe('dateToBucketKey', () => {
        it('converts a date object to a date rounded to the nearest minute', () => {
            const date = new Date();
            date.setUTCMinutes(1);

            let bucketKey = lib.dateToBucketKey(date);
            const [d, t] = bucketKey.split('@');

            expect(t).to.equal(date.getUTCHours()+':0:0');
        });
    });

    describe('dateDiff', () => {
        it('returns the bucket keys between two dates', () => {
            const start = new Date(Date.UTC(2017, 0, 1, 23, 50, 0));
            const stop = new Date(Date.UTC(2017, 0, 2, 0, 30, 0));

            let increments = lib.bucketDiff(start, stop);
            expect(increments[0]).to.equal('2017-0-1@23:55:0');
            expect(increments[1]).to.equal('2017-0-2@0:0:0');
            expect(increments[2]).to.equal('2017-0-2@0:5:0');
            expect(increments[3]).to.equal('2017-0-2@0:10:0');
            expect(increments[4]).to.equal('2017-0-2@0:15:0');
            expect(increments[5]).to.equal('2017-0-2@0:20:0');
            expect(increments[6]).to.equal('2017-0-2@0:25:0');
            expect(increments[7]).to.equal('2017-0-2@0:30:0');
        });
    });
});
