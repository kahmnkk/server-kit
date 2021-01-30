// Common
const querys = require('@src/querys');
const errors = require('@src/errors');

// Utils
const utils = require('@src/utils/utils');
const logger = require('@src/utils/logger');

// DB
const dbMgr = require('@src/database/dbMgr');

let registTimestamp = 0;
let reRegistUpTime = 0;
let devTime = false;
let offsetDB = 0;

let devOneDaySec = 30; // 60 * 10; // 10분
const offsetSystem = new Date().getTimezoneOffset() * 60; // UTC
const oneDaySec = 86400; // 60 * 60 * 24;
const oneDayMilsec = 86400000; // 60 * 60 * 24 * 1000;
const weekDay = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};
const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const timestampMax = '2038-01-19 03:14:07';

class Time {
    constructor() {}

    get oneDaySec()    { return oneDaySec; } // prettier-ignore
    get oneDayMilsec() { return oneDayMilsec; } // prettier-ignore
    get weekDay()      { return weekDay; } // prettier-ignore
    get timestampMax() { return 2147483647; /*this.unixtime(timestampMax);*/ } // prettier-ignore
    get devOneDaySec() { return devOneDaySec; } // prettier-ignore
    set devOneDaySec(v) { devOneDaySec = v; } // prettier-ignore
    get devTime()      { return devTime; } // prettier-ignore

    async init(dev = false) {
        try {
            const [result] = await dbMgr.mysql.master.query(querys.master.timestamp, { log: false });
            registTimestamp = Number(result.now);
            offsetDB = Number(result.offset);
            let upTimeSec = process.uptime();
            reRegistUpTime = upTimeSec;
            devTime = dev;
        } catch (err) {
            logger.error(err);
        }
    }

    async syncTime() {
        setInterval(async () => {
            try {
                const [result] = await dbMgr.mysql.master.query(querys.master.timestamp, { log: false });
                registTimestamp = Number(result.now);
                offsetDB = Number(result.offset);
                let upTimeSec = process.uptime();
                reRegistUpTime = upTimeSec;
                logger.log('[Time] ' + this.now().toString());
            } catch (err) {
                logger.error(err);
            }
        }, 1000 * 60 * 10);
    }

    /**
     * @returns {Date} DateObject sync with server time
     */
    now() {
        let upTimeSec = process.uptime();
        let time = new Date();
        time.setTime(Math.floor(registTimestamp + upTimeSec - reRegistUpTime) * 1000);
        return time;
    }

    /**
     * only for client
     * @returns {Number} offset db time by sec.
     */
    offsetDB() {
        if (devTime == true) {
            return 0; // only for client
        }
        return offsetDB;
    }

    /**
     * application server time only
     *
     * @returns {string} - datetime.milliSeconds yyyy-MM-dd hh:mm:ss.zzz
     */
    datetimeAppl() {
        const date = new Date();

        const Y   = String(date.getFullYear()); // prettier-ignore
        const M   = ('0'  + String(date.getMonth() + 1)).substr(-2); // prettier-ignore
        const D   = ('0'  + String(date.getDate())).substr(-2); // prettier-ignore
        const hh  = ('0'  + String(date.getHours())).substr(-2); // prettier-ignore
        const mm  = ('0'  + String(date.getMinutes())).substr(-2); // prettier-ignore
        const ss  = ('0'  + String(date.getSeconds())).substr(-2); // prettier-ignore
        const sss = ('00' + String(date.getMilliseconds())).substr(-3); // prettier-ignore

        return Y + '-' + M + '-' + D + ' ' + hh + ':' + mm + ':' + ss + '.' + sss;
    }

    /**
     * convert to datetime(yyyy-MM-dd HH:mm:ss) from unix timestamp
     *
     * @param {number} num - unix timestamp
     * @returns {string} - datetime
     */
    datetime(num = 0) {
        let rtn = '0000-00-00 00:00:00';

        if (num == 0) {
            num = this.unixtime();
        }

        let date = new Date(num * 1000);

        let Y = String(date.getFullYear());
        let M = '0' + String(date.getMonth() + 1);
        let D = '0' + String(date.getDate());
        let hh = '0' + String(date.getHours());
        let mm = '0' + String(date.getMinutes());
        let ss = '0' + String(date.getSeconds());
        // let sss = '00' + String(date.getMilliseconds());

        M = M.substr(-2);
        D = D.substr(-2);
        hh = hh.substr(-2);
        mm = mm.substr(-2);
        ss = ss.substr(-2);
        // sss = sss.substr(-3);

        rtn = Y + '-' + M + '-' + D + ' ' + hh + ':' + mm + ':' + ss; // + '.' + sss;

        return rtn;
    }

    /**
     * convert to unix timestamp from datetime(yyyy-MM-dd HH:mm:ss)
     *
     * @param {string} str - datetime
     * @returns {number} - unix timestamp
     * @see Timezone can be different between System and DB
     */
    unixtime(str = '0000-00-00 00:00:00') {
        let rtn = 0;

        let date = null;
        //let offset = 0;

        if (str == '0000-00-00 00:00:00') {
            // DB Timezone offset for UTC (this.now() : DB time)
            date = this.now();
            //offset = offsetDB;
        } else {
            // System Timezone offset for UTC
            date = new Date(str);
            //offset = offsetSystem;
        }

        rtn = Math.floor(date.getTime() / 1000); // - offset;

        return rtn;
    }

    nowTimestamp(milSec = false) {
        let upTimeSec = process.uptime();
        let now = registTimestamp + upTimeSec - reRegistUpTime;
        if (milSec == true) {
            return Math.floor(now * 1000);
        } else {
            return Math.floor(now);
        }
    }

    // /**
    //  * yyyy-MM-dd is valid ?
    //  *
    //  * @param {string} dt
    //  * @returns {boolean}
    //  */
    // validDatetime(dt = '0000-00-00 00:00:00') {
    //     let rtn = true;

    //     const delimiter = ',';
    //     let temp = dt.replace(/[^0-9]/g, delimiter);
    //     temp = temp.split(delimiter);

    //     const year = Number(temp[0]);
    //     const month = Number(temp[1]);
    //     const day = Number(temp[2]);

    //     const myDate = new Date(dt);

    //     if (myDate.getMonth() + 1 != month || myDate.getDate() != day || myDate.getFullYear() != year) {
    //         rtn = false;
    //     }

    //     return rtn;
    // }

    /**
     * @returns {number}
     */
    secondsPerDay() {
        if (this.devTime == true) {
            return devOneDaySec;
        }
        return oneDaySec;
    }

    /**
     * @params {number} n weeks
     * @returns {number}
     * @example                        real    | dev
     *          time.secondsInWeek(4): 2419200 | 16800
     *          time.secondsInWeek(3): 1814400 | 12600
     *          time.secondsInWeek(2): 1209600 |  8400
     *          time.secondsInWeek(1):  604800 |  4200
     */
    secondsInWeek(n) {
        n = Math.max(1, n);
        if (this.devTime == true) {
            return devOneDaySec * 7 * n;
        }
        return oneDaySec * 7 * n;
    }

    /**
     * @params {number} n minutes
     * @returns {number}
     * @example                            real | dev
     *          time.secondsInMinutes(40): 2400 |  16
     *          time.secondsInMinutes(30): 1800 |  12
     *          time.secondsInMinutes(20): 1200 |   8
     *          time.secondsInMinutes(10):  600 |   4
     */
    secondsInMinutes(n) {
        n = Math.max(1, n);
        if (this.devTime == true) {
            return Math.floor((n * 60) / Math.floor(oneDaySec / devOneDaySec));
        }
        return n * 60;
    }

    /**
     * filtering valid day of week
     *
     * @param {number} wd day of week
     * @returns {number} one of range between this.weekDay.sunday and this.weekDay.saturday
     */
    dayFilter(wd) {
        return Math.min(Math.max(this.weekDay.sunday, wd), this.weekDay.saturday); // fix between 0 ~ 6
    }

    /**
     * Thress-letter day of week name
     *
     * @param {number} wd day of week
     * @returns {string}
     */
    dayName(wd) {
        wd = this.dayFilter(wd);
        return weekDayNames[wd];
    }

    /**
     * relative day of week
     *
     * @param {number} timestamp
     * @returns {number} this.weekDay
     */
    dayOfWeekRelative(timestamp = this.unixtime()) {
        let rtn = this.weekDay.sunday;

        const modWeekDay = 7;

        if (this.devTime == true) {
            timestamp = timestamp + offsetDB;
            const elapsedSecReal = timestamp % oneDaySec; // 가상요일 동작 기준 : 0 ~ 86399
            const elapsedDayVirt = Math.floor(elapsedSecReal / devOneDaySec); // 가상일자 경과일 : 0 ~
            rtn = elapsedDayVirt % modWeekDay;
        } else {
            // timestamp = timestamp + offsetDB;
            const dt = new Date(timestamp * 1000);
            rtn = dt.getDay();
        }

        return rtn;
    }

    /**
     * relative week start unix timestamp by bw
     *
     * @param {number} bw base weekday weekDay.sunday ~ weekDay.saturday
     * @param {number} timestamp
     * @returns {number} unix timestamp
     */
    weekStartTimeRelative(bw = this.weekDay.sunday, timestamp = this.unixtime()) {
        let rtn = 0;

        bw = this.dayFilter(bw);

        const modWeekDay = 7;

        if (this.devTime == true) {
            const elapsedSecReal = (timestamp + offsetDB) % oneDaySec; // 가상요일 동작 기준 : 0 ~ 86399
            // const elapsedDayVirt = Math.floor(elapsedSecReal / devOneDaySec); // 가상일자 경과일 : 0 ~

            let elapsedSecInWeek = (elapsedSecReal % (devOneDaySec * modWeekDay)) - devOneDaySec * bw;

            rtn = timestamp - elapsedSecInWeek;
            if (elapsedSecInWeek < 0) {
                rtn -= devOneDaySec * modWeekDay;
            }
        } else {
            //rtn = this.weekStartTime(bw, timestamp);
            // const dt = new Date(this.datetime(timestamp - padded));
            //const wdAbsolute = dt.getUTCDay();

            const dt = new Date(timestamp * 1000);
            const wdAbsolute = dt.getDay();

            const wdRelative = (wdAbsolute + (modWeekDay - bw)) % modWeekDay;
            const wdDiff = 0 - wdRelative;

            let elapsedSecInWeek = oneDaySec * wdDiff - ((timestamp + offsetDB) % oneDaySec);

            rtn = timestamp + elapsedSecInWeek;
        }

        return rtn;
    }

    /**
     * relative week next unix timestamp by bw
     *
     * @param {number} bw base weekday weekDay.sunday ~ weekDay.saturday
     * @param {number} timestamp
     * @returns {number} unix timestamp
     */
    weekNextTimeRelative(bw = this.weekDay.sunday, timestamp = this.unixtime()) {
        let rtn = this.weekStartTimeRelative(bw, timestamp);

        const spd = this.secondsPerDay();
        rtn += spd * 7;

        return rtn;
    }

    /**
     * relative week remain seconds by bw
     *
     * @param {number} bw base weekday weekDay.sunday ~ weekDay.saturday
     * @param {number} timestamp
     * @returns {number} unix timestamp
     */
    weekRemainTimeRelative(bw = this.weekDay.sunday, timestamp = this.unixtime()) {
        let rtn = this.weekNextTimeRelative(bw, timestamp);
        rtn -= timestamp;

        return rtn;
    }

    /**
     * How many days elapsed from '1970-01-01 00:00:00' using with padding
     * similar to dailyCode
     *
     * @param {number} timestamp
     * @returns {number}
     */
    toDays(timestamp = this.unixtime()) {
        return Math.floor(timestamp / this.secondsPerDay());
    }

    /**
     * unix timestamp by period in a day
     *
     * @param {number} period unit is seconds
     * @param {number} timestamp
     * @returns {number}
     * @see return value can be greater than Math.pow(2, 32)
     */
    periodCode(period, timestamp = this.unixtime()) {
        if (period == 0) {
            return 0;
        }

        const rtnPrefix = this.toDays(timestamp);

        const spd = this.secondsPerDay();
        const rtnSuffix = Math.floor((timestamp % spd) / period);

        return rtnPrefix * 10000 + rtnSuffix;
    }

    /**
     * unix timestamp by period : elapsed
     *
     * @param {number} period unit is seconds
     * @param {number} timestamp
     * @returns {number} unix timestamp
     */
    periodTimeElapsed(period, timestamp = this.unixtime()) {
        if (period == 0) {
            return 0;
        }
        timestamp = timestamp + offsetDB;

        return Math.floor(timestamp % period);
    }

    /**
     * unix timestamp by period : remains
     *
     * @param {number} period unit is seconds
     * @param {number} timestamp
     * @returns {number} unix timestamp
     */
    periodTimeRemains(period, timestamp = this.unixtime()) {
        return period - this.periodTimeElapsed(period, timestamp);
    }

    /**
     * unix timestamp by period : current
     *
     * @param {number} period unit is seconds
     * @param {number} timestamp
     * @returns {number} unix timestamp
     */
    periodTimeCurrent(period, timestamp = this.unixtime()) {
        return timestamp - this.periodTimeElapsed(period, timestamp);
    }

    /**
     * unix timestamp by period : next
     *
     * @param {number} period unit is seconds
     * @param {number} timestamp
     * @returns {number} unix timestamp
     */
    periodTimeNext(period, timestamp = this.unixtime()) {
        return timestamp + this.periodTimeRemains(period, timestamp);
    }
}

module.exports = new Time();
