const winston = require('winston');
winston.config.syslog.levels.warn = winston.config.syslog.levels.warning;
require('winston-daily-rotate-file');

const config = require('@root/config');

const cutMin = 10;

// Debug Log
let debugmode = false;
let args = process.execArgv;
if (args.length > 0) {
    debugmode = args.some((arg) => /^--(?:debug|inspect)=?/.test(arg) || /^--(?:debug|inspect)-brk=?/.test(arg));
}

class Logger {
    constructor() {
        this.server = null;
        this.workerId = 0;

        this.devLogger = null;

        this.fileIdx = 0;
        this.consoleIdx = 0;
    }

    init(serverType) {
        this.server = serverType;
    }

    log(data) {
        if (config.dev == true) {
            if (typeof data == 'object') {
                data = JSON.stringify(data);
            }
            this.logWinston(winston.config.syslog.levels.debug, data);
        }
    }

    debug(data) {
        if (config.dev == true) {
            if (typeof data == 'object') {
                data = JSON.stringify(data);
            }
            this.logWinston(winston.config.syslog.levels.debug, data);
        }
    }

    info(data) {
        if (typeof data == 'object') {
            data = JSON.stringify(data);
        }
        this.logWinston(winston.config.syslog.levels.info, data);
    }

    warn(data) {
        if (typeof data == 'object') {
            data = JSON.stringify(data);
        }
        this.logWinston(winston.config.syslog.levels.warning, data);
    }

    error(data) {
        let err = data;
        if (typeof data == 'object') {
            err = 'code: ' + data.code + ', message: ' + data.message + ', stack: ' + data.stack;
        }
        this.logWinston(winston.config.syslog.levels.error, err);
    }

    /**
     * winston.config.syslog.levels to string
     *
     * @param {number} level
     * @see https://github.com/winstonjs/winston/#logging-levels
     * @see winston.config.syslog.levels: {"emerg":0,"alert":1,"crit":2,"error":3,"warning":4,"notice":5,"info":6,"debug":7}
     */
    levelStringWinston(level) {
        let rtn = null;

        switch (level) {
            case winston.config.syslog.levels.error:
                rtn = 'error';
                break;
            case winston.config.syslog.levels.warning:
                rtn = 'warn';
                break;
            case winston.config.syslog.levels.info:
                rtn = 'info';
                break;
            case winston.config.syslog.levels.debug:
                rtn = 'debug';
                break;
            default:
                rtn = 'info';
        }

        return rtn;
    }

    levelStringCustom(level) {
        let rtn = this.levelStringWinston(level);

        return rtn.toUpperCase().concat(' ').substr(0, 5);
    }

    levelStringFromWinstonString(str) {
        let level = winston.config.syslog.levels[str];
        if (level === undefined) {
            level = winston.config.syslog.levels.info;
        }

        return this.levelStringCustom(level);
    }

    logWinston(level, data) {
        const lsw = this.levelStringWinston(level);

        // dev 로그
        if (debugmode == true) {
            console.log(`${this.consoleIdx++} ${this.getDateFormat(new Date())}[${lsw}] ${data}`);
        }

        if (this.devLogger == null) {
            this.devLogger = winston.createLogger({
                level: 'debug',
                transports: [
                    new winston.transports.DailyRotateFile({
                        filename: 'devLog/' + this.server + '/' + this.server + '.%DATE%.log',
                        frequency: `${cutMin}m`,
                        zippedArchive: false,
                        datePattern: 'YYYY-MM-DD-HH-mm',
                        format: winston.format.printf((info) => `${this.fileIdx++} ${this.getDateFormat(new Date())}[${this.levelStringFromWinstonString(info.level)}] - ${info.message}`),
                    }),

                    new winston.transports.Console({
                        format: winston.format.combine(
                            winston.format.colorize(),
                            winston.format.printf((info) => `${this.consoleIdx++} ${this.getDateFormat(new Date())}[${info.level}] - ${info.message}`),
                        ),
                    }),
                ],
            });
        }

        this.devLogger.log(lsw, data);
    }

    getDateFormat(date) {
        let Y = String(date.getFullYear());
        let M = '0' + String(date.getMonth() + 1);
        let D = '0' + String(date.getDate());
        let hh = '0' + String(date.getHours());
        let mm = '0' + String(date.getMinutes());
        let ss = '0' + String(date.getSeconds());
        let sss = '00' + String(date.getMilliseconds());

        M = M.substr(-2);
        D = D.substr(-2);
        hh = hh.substr(-2);
        mm = mm.substr(-2);
        ss = ss.substr(-2);
        sss = sss.substr(-3);

        return '[' + Y + '-' + M + '-' + D + ' ' + hh + ':' + mm + ':' + ss + '.' + sss + ']';
    }
}

module.exports = new Logger();
