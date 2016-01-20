/**
 * author: oldj
 * blog: http://oldj.net
 */

(function (global) {
    'use strict';

    var LOADER_NAME = "myloader";
    var LOADER_FN_DEFINE = "define";
    if (global[LOADER_NAME]) return;

    var qn = '_' + LOADER_NAME + '_q';
    var q = global[qn] = global[qn] || [];
    var registered_modules = {};
    var registered_packages = {};
    var loaded_modules = {};
    var timeout_modules = {};
    var on_modules_loaded = {};
    var doc = document;
    var _idx = 0;

    var loader = function () {
        var a = Array.prototype.slice.call(arguments);
        if (a.length >= 2) {
            q.push(a);
        }
    };
    loader.q = q;

    function Loader(name, deps, callback) {
        this.name = name;
        this.deps = deps;
        this.callback = callback;
        this.deps_left = deps.length;

        this.init();
    }

    Loader.prototype = {
        init: function () {
            if (this.deps_left == 0) {
                // 没有依赖，直接加载
                this.loaded(this.name);
            }

            for (var i = 0; i < this.deps.length; i++) {
                this.loadModule(this.deps[i]);
            }
        },

        loadModule: function (name) {
            var _this = this;
            if (loaded_modules.hasOwnProperty(name)) {
                // 该模块已经加载了
                this.loaded(name);
                return;
            }

            var m = registered_modules[name] || checkModPackage(name);
            if (!m) {
                throw new Error('unregisted module: ' + name);
            }
            var el = doc.createElement('script');
            el.src = m.url;
            m.charset && (el.charset = m.charset);
            var node_script = doc.getElementsByTagName('script')[0];
            node_script.parentNode.insertBefore(el, node_script);

            on_modules_loaded[name] = on_modules_loaded[name] || [];
            on_modules_loaded[name].push(function () {
                _this.loaded();
            });

            if (m.timeout) {
                clearTimeout(timeout_modules[name]);
                timeout_modules[name] = setTimeout(function () {
                    loader.define(name, function () {
                    });
                }, m.timeout);
            }
        },

        loaded: function () {
            this.deps_left--;
            if (this.deps_left <= 0) {
                this.run();
            }
            checkQueue();
        },

        run: function () {
            if (loaded_modules[this.name]) return;

            var modules = [];
            var i;

            for (i = 0; i < this.deps.length; i++) {
                modules.push(loaded_modules[this.deps[i]]);
            }
            loaded_modules[this.name] = this.callback.apply(null, modules) || {};

            var fns = on_modules_loaded[this.name] || [];
            var fn;
            while (fn = fns.shift()) {
                fn.call();
            }
        }
    };

    function checkModPackage(name) {
        var a = name.split('/');
        if (a.length == 1) return;
        var package_name = a[0];
        var config;
        if (registered_packages.hasOwnProperty(package_name)) {
            config = {
                name: name,
                charset: registered_packages[package_name].charset,
                url: registered_packages[package_name].url + name + '.js'
            };
            loader.register(config);
            return config;
        }
    }

    function checkQueue() {
        var i;
        var l = q.length;
        var a;
        for (i = 0; i < l; i++) {
            a = q.shift();
            if (!a || !a[0]) continue;
            if (loader.is_registered(a[0]) || loaded_modules.hasOwnProperty(a[0])) {
                loader.use.apply(null, a);
            } else {
                q.push(a);
            }
        }
    }

    loader.checkQueue = checkQueue;
    loader.autoCheckQueue = function (i) {
        return setInterval(checkQueue, i || 100);
    };

    global[LOADER_NAME] = loader;
    global[LOADER_FN_DEFINE] = function (module_name, dependences, fn) {
        if (typeof dependences == 'function') {
            fn = dependences;
            dependences = [];
        }
        new Loader(module_name, dependences, fn);
    };

    /**
     *
     * @param config
     *      config 格式：
     *      {
     *          name: 'a',
     *          url: 'http://xxx/libs/a.js'
     *      }
     */
    loader.register = function (config) {
        var name;
        if (Object.prototype.toString.call(config) === '[object Array]') {
            // 传入的是一个数组
            for (var i = 0; i < config.length; i++) {
                loader.register(config[i]);
            }
        } else {
            name = config.name;
            if (name.match(/\/$/)) {
                // name 是 'a/' 这样的格式
                registered_packages[name.substr(0, name.length - 1)] = config;
            } else {
                registered_modules[name] = config;
            }
            checkQueue();
        }
    };

    loader.use = loader.require = function (modules, callback) {
        if (typeof modules == 'string') {
            modules = [modules];
        }

        new Loader(_idx++, modules, callback);
    };

    loader.is_registered = function (module_name) {
        return registered_modules.hasOwnProperty(module_name) ||
            registered_packages.hasOwnProperty(module_name.split('/')[0]);
    };

    if (typeof exports == 'object') {
        exports[LOADER_NAME] = loader;
    }

})(window);
