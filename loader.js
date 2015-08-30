/**
 * author: oldj
 * blog: http://oldj.net
 */

(function (global) {
	"use strict";

	var LOADER_NAME = "myloader";
	var LOADER_FN_DEFINE = "define";
	if (global[LOADER_NAME]) return;

	var loader = {};
	var registered_modules = {};
	var loaded_modules = {};
	var on_modules_loaded = {};
	var doc = document;
	var _idx = 0;

	function Loader(name, deps, callback) {
		console.log("name", name);
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

			var m = registered_modules[name];
			if (!m) {
				throw new Error("unregisted module: " + name);
			}
			var el = doc.createElement("script");
			el.src = m.url;
			var node_script = doc.getElementsByTagName("script")[0];
			node_script.parentNode.insertBefore(el, node_script);

			on_modules_loaded[name] = on_modules_loaded[name] || [];
			on_modules_loaded[name].push(function () {
				_this.loaded();
			});
		},

		loaded: function () {
			this.deps_left--;
			if (this.deps_left <= 0) {
				this.run();
			}
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

	global[LOADER_NAME] = loader;
	global[LOADER_FN_DEFINE] = function (module_name, dependences, fn) {
		if (typeof dependences == "function") {
			fn = dependences;
			dependences = [];
		}
		new Loader(module_name, dependences, fn);
	};

	/**
	 *
	 * @param configs
	 *      configs 格式：
	 *      {
	 *          name: "a",
	 *          url: "http://xxx/libs/a.js"
	 *      }
	 */
	loader.register = function (configs) {
		if (Object.prototype.toString.call(configs) === "[object Array]") {
			// 传入的是一个数组
			for (var i = 0; i < configs.length; i++) {
				loader.register(configs[i]);
			}
		} else {
			registered_modules[configs.name] = configs;
		}
	};

	loader.use = function (modules, callback) {
		if (typeof modules == "string") {
			modules = [modules];
		}

		new Loader(_idx++, modules, callback);
	};

})(window);
