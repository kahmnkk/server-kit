Object.defineProperty(Array.prototype, 'select', {
    value: (closure) => {
        for (let i = 0; i < this.length; ++i) {
            if (closure(this[i])) {
                return this[i];
            }
        }
        return null;
    },
});

Object.defineProperty(Object.prototype, 'deepFreeze', {
    value: (object) => {
        var propNames = Object.getOwnPropertyNames(object);

        for (let name of propNames) {
            let value = object[name];

            object[name] = value && typeof value === 'object' ? Object.deepFreeze(value) : value;
        }

        return Object.freeze(object);
    },
});

Object.defineProperty(Object.prototype, 'mergeIntersect', {
    value: (to, from) => {
        for (let k in from) {
            if (to.hasOwnProperty(k) == true) {
                to[k] = from[k];
            }
        }

        return to;
    },
});

Object.defineProperty(Object.prototype, 'mergeIntersectWithCalc', {
    value: (to, from) => {
        for (let k in from) {
            if (to.hasOwnProperty(k) == true) {
                let v = from[k];
                if (v != null && v.constructor.name == 'String') {
                    const regexpCalc = new RegExp('^(?:[0-9]+\\s*[+\\-*/]\\s*' + k + '|' + k + '\\s*[+\\-*/]\\s*[0-9]+)$');
                    const matches = v.match(regexpCalc);
                    if (matches != null) {
                        v = v.replace(k, to[k]);
                        v = eval(v);
                    }
                }
                to[k] = v;
            }
        }

        return to;
    },
});

Object.defineProperty(global, '__stack', {
    get: function () {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        var err = new Error();
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    },
});

Object.defineProperty(global, '__line', {
    get: function () {
        return __stack[1].getLineNumber();
    },
});

Object.defineProperty(global, '__function', {
    get: function () {
        return __stack[1].getFunctionName();
    },
});
