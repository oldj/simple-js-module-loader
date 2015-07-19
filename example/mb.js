/**
 * author: oldj
 * blog: http://oldj.net
 */

define("b", ["d"], function () {
	console.log("b!");

	return {
		init: function () {
			console.log("init from module b!");
		}
	};
});
