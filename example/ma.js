/**
 * author: oldj
 * blog: http://oldj.net
 */

define("a", ["b", "c"], function (b) {
	console.log("a!");
	b.init();

	return {
		hello: function () {
			console.log("Hello!");
		}
	}
});
