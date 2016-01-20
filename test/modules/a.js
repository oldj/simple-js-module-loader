/**
 * author: oldj
 * blog: http://oldj.net
 */

define('a', ['b', 'c'], function (b) {
    b.init();

    return {
        getv: function () {
            return 'a';
        }
    }
});
