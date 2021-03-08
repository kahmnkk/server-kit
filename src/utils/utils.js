// npm
const rp = require('request-promise');

const config = require('@root/config');
const errors = require('@src/errors');

class Utils {
    constructor() {}

    isEmptyObject(arg) {
        return this.getType(arg) == 'object' && Object.keys(arg).length === 0;
    }

    isEmptyArray(arg) {
        return this.getType(arg) == 'array' && arg.length === 0;
    }

    /**
     *
     * @param {object} a
     * @param {object} b
     * @returns {boolean}
     */
    sameKeysObject(a, b) {
        let rtn = false;

        let aLen = 0,
            bLen = 0;

        if (this.getType(a) == 'object' && this.getType(b) == 'object') {
            aLen = Object.keys(a).length;
            bLen = Object.keys(b).length;
        }

        if (aLen > 0 && bLen > 0) {
            let cnt = 0;

            for (let i in a) {
                if (b.hasOwnProperty(i) == false) {
                    break;
                }
                cnt++;
            }

            if (cnt == aLen) {
                rtn = true;
            }
        }

        return rtn;
    }

    /**
     *
     * @param {object} asis
     * @param {object} tobe
     * @returns {object} pairs of different keys
     * @see
     *     asis = {a: 1,   b: undefined,       d: 4}
     *     tobe = {a: '1', b: 2,         c: 3, d: 4}
     *     diffObject(asis, tobe) = { a: '1', b: 2, c: 3 }
     */
    diffObject(asis, tobe) {
        let rtn = {};

        for (let i in tobe) {
            if (asis.hasOwnProperty(i) == false || asis[i] !== tobe[i]) {
                rtn[i] = tobe[i];
            }
        }

        return rtn;
    }

    hasKeys(keys, values) {
        for (let k in keys) {
            if (values[k] == null) {
                return false;
            }
        }
        return true;
    }

    /**
     * check only has keys
     *
     * @param {Array} needles keys for search
     * @param {Object} haystack search container
     * @returns {boolean}
     * @see
     *      checkKeys(['a'],      {"a": 1, "c": null}) > true
     *      checkKeys(['a', 'b'], {"a": 1, "b": null}) > true
     *      checkKeys(['a', 'b'], {"a": 1, "c": null}) > false
     */
    checkKeys(needles, haystack) {
        for (let i = 0, i_len = needles.length; i < i_len; i++) {
            if (haystack.hasOwnProperty(String(needles[i])) == false) {
                return false;
            }
        }
        return true;
    }

    /**
     *
     * @param {Object} asis
     * @param {Object} tobe
     */
    mergeObj(asis, tobe) {
        for (let k in tobe) {
            if (asis.hasOwnProperty(k) == true) {
                asis[k] = tobe[k];
            }
        }
    }

    injectPromise(func, ...args) {
        return new Promise((resolve, reject) => {
            func(...args, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }

    promiseInjector(scope) {
        return (func, ...args) => {
            return this.injectPromise(func.bind(scope), ...args);
        };
    }

    setRoute(router, url, func) {
        if (config.dev == true) router.get(url, func);
        router.post(url, func);
    }

    setMulterRoute(router, url, multer, func) {
        if (config.dev == true) router.get(url, multer, func);
        router.post(url, multer, func);
    }

    /**
     * shuffle the arguments
     *
     * @param {Array} arr
     * @description let a = [1, 2, 3, 4, 5]
     *              utils.shuffle(a);
     *              now a will be [3, 1, 4, 5, 1] or shuffled ...
     */
    shuffle(arr) {
        let asis = Math.random();
        arr.sort(function () {
            let tobe = Math.random();
            return asis == tobe ? 0 : asis < tobe ? -1 : 1;
        });

        return arr;
    }

    /**
     * forcingly convert to number type
     * 1       > 1
     * 3.14    > 3.14
     * '3.14'  > 3.14
     * Math.PI > 3.141592653589793
     * 0       < undefined, null, false, [], {}, 'ab'
     * 1       < true, '1'
     *
     * @param {any} arg
     * @returns {number}
     */
    toNumberOnly(arg) {
        let rtn = Number(arg);

        if (isNaN(rtn) == true) {
            rtn = 0;
        }

        return rtn;
    }

    /**
     *
     * @param {string} str original string
     * @param {string} pad to padded string
     * @param {number} len length
     * @param {number} dir direction {-1: left, 1: right}
     * @returns {string}
     * @see like a printf
     *      strPadding('abc', 'Й', 5)    // [ЙЙabc]
     *      strPadding('abc', ' ', 5)    // [  abc]
     *      strPadding('abc', ' ', 5, 1) // [abc  ]
     *      strPadding('abc', ' ', 2)    // [abc]
     */
    strPadding(str, pad, len, dir = -1) {
        let rtn = String(str);

        if (rtn.length >= len) {
            return rtn;
        }

        pad = pad.repeat(len - rtn.length);

        switch (dir) {
            case -1:
                rtn = pad.concat(rtn);
                break;
            case 1:
                rtn = rtn.concat(pad);
                break;
        }

        return rtn;
    }

    /**
     * min ~ max 사이의 임의의 정수 반환
     * @param {number} min  최소
     * @param {number} max  최대
     * @returns {number}    랜덤값
     */
    getRandomInt(min, max) {
        if (min == max) {
            return min;
        } else {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    getRandomIndex(...args) {
        let total = 0;
        for (let i = 0; i < args.length; i++) {
            total += Number(args[i]);
        }
        let pick = Math.floor(Math.random() * total);
        let sum = 0;
        for (let i = 0; i < args.length; i++) {
            sum += Number(args[i]);
            if (sum > pick) {
                return Number(i);
            }
        }
        return 0;
    }

    totalPage(count, numOfPage) {
        let pageFull = count % numOfPage == 0 ? 0 : 1;
        return Math.floor(count / numOfPage) + pageFull;
    }

    getObjectByArray(objectArray, byKey) {
        let ret = {};
        objectArray.forEach((obj) => {
            ret[obj[byKey]] = obj;
        });
        return ret;
    }

    getMultikeyObjectByArray(objectArray, byKey) {
        let ret = {};
        objectArray.forEach((obj) => {
            if (ret[obj[byKey]] == null) {
                ret[obj[byKey]] = [];
            }
            ret[obj[byKey]].push(obj);
        });
        return ret;
    }

    sleep(milliSec) {
        return new Promise((resolve) => setTimeout(resolve, milliSec));
    }

    getTotalArray(objectArray, byKey, byValue) {
        let totalArr = [];
        for (let i in objectArray) {
            let idx = totalArr.findIndex((x) => x[byKey] == objectArray[i][byKey]);
            if (idx == -1) {
                totalArr.push(objectArray[i]);
            } else {
                totalArr[idx][byValue] += objectArray[i][byValue];
            }
        }
        return totalArr;
    }

    /**
     *
     * @param {Array} array
     * @returns {Array}
     * @see arrayUnique([1,2,3,1,2]) = [1,2,3]
     * @warning elements of Array must be primitive type. shouldn't be complex type.
     */
    arrayUnique(array) {
        return array.filter((value, index, self) => self.indexOf(value) === index);
    }

    /**
     * https://dev.to/ryanfarney3/array-chunking-2nl8
     *
     * @param {Array} array
     * @param {number} size
     * @see arrayChunk([1,2,3,4,5], 3) = [[1,2,3], [4,5]]
     */
    arrayChunk(array, size) {
        //declaring variable 'chunked' as an empty array
        let chunked = [];

        if (this.getType(array) != 'array' || size <= 0 || array.length <= 0) {
            return chunked;
        }

        size = this.toNumberOnly(size);

        //looping through the array until it has been entirely "manipulated" or split into our subarrays
        while (array.length > 0) {
            //taking the spliced segments completely out of our original array
            //pushing these subarrays into our new "chunked" array
            chunked.push(array.splice(0, size));
        }

        //returning the new array of subarrays
        return chunked;
    }

    errorHandling(errObj) {
        let err = new Error();

        if (errObj == null) {
            errObj = errors.undefinedError;
        }

        err.code = errObj.code;
        err.message = errObj.message;
        return err;
    }

    /**
     *
     * @param {any} arg
     * @returns {string} 'number'|'string'|'array'|'object'|'undefined'|'null'
     */
    getType(arg) {
        let rtn = null;

        if (arg !== null) {
            rtn = typeof arg;
        }

        if (rtn === 'object') {
            // rtn = arg.constructor.name.toLowerCase(); // named(customized) object returns It's name. ex) class User > 'user'
            const tp = String(arg.constructor);
            if (tp.indexOf('function Array') == 0) {
                rtn = 'array';
            }
        }

        return String(rtn);
    }

    /**
     * multiple query for DB (MySQL)
     *
     * @param {object} conn connection
     * @param {object} tran transaction
     * @param {Array} queries ["INSERT INTO ...", "UPDATE ...", ...]
     * @returns {null | boolean}
     * @description null: nothing, false: failure, true: success
     */
    async multiQueryDB(conn, tran, queries) {
        let rtn = null;

        if (queries.length == 0) {
            return rtn;
        }

        const stmt = conn.makeMultipleQuery(queries);
        //const tran = await conn.beginTransaction();
        try {
            await conn.query(tran, stmt);
            //await conn.commit(tran);
            rtn = true;
        } catch (err) {
            rtn = false;
            //await conn.rollback(tran);
            throw err;
        }

        return rtn;
    }

    /**
     * multiple query for Cache (Redis)
     *
     * @param {object} conn connection
     * @param {Array} queries [['hset', 'myhash', 'k1', 'v1'], ['hmset', 'myhash', 'k2', 'v2', 'k3', 'v3'], ...]
     * @returns {null | boolean | any}
     * @description null: nothing, false: failure, any: success
     */
    async multiQueryCache(conn, queries) {
        let rtn = null;

        if (queries.length == 0) {
            return rtn;
        }

        const that = this;

        const promise = new Promise(function (resolve, reject) {
            const tran = conn.multi(queries);
            tran.exec(function (err, replies) {
                if (err) {
                    this.discard();
                    reject(err);
                } else {
                    resolve(replies);
                }
            });
        });

        try {
            await promise
                .then(function (message) {
                    rtn = message;
                })
                .catch(function (err) {
                    rtn = false;
                    logger.error('[' + that.constructor.name + '] code: ' + err.code + ', message: ' + err.message + ', stack: ' + err.stack);
                    throw err;
                });
        } catch (err) {
            throw this.errorHandling(errors.failedCache);
        }

        return rtn;
    }

    /**
     *
     * @param {string} uri
     * @param {number} userSequence
     * @param {Object} body
     */
    async requestHTTP(uri, userSequence, body, errorCode = errors.httpTimeOut, timeOut = config.timeout['request-promise']) {
        const mergeBody = Object.assign(body, { userSequence: userSequence });

        try {
            const response = await rp({
                uri: uri,
                method: 'POST',
                body: mergeBody,
                json: true,
                timeout: timeOut,
                headers: {
                    Connection: 'close',
                },
                forever: false,
            });

            if (response.data && !response.error) {
                return response.data;
            }
        } catch (err) {
            logger.error(err);
            if (errorCode.code == errors.httpETimeOut.code) {
                if (err.message.includes('ETIMEDOUT') == false) {
                    errorCode = errors.httpTimeOut;
                }
            }
            throw this.errorHandling(errorCode);
        }
    }
}

module.exports = new Utils();
