/**
 * @author oldj
 * @blog http://oldj.net
 */

'use strict';

myloader.register([{
    name: "a",
    url: "./modules/a.js"
}, {
    name: "b",
    url: "./modules/b.js"
}, {
    name: "c",
    url: "./modules/c.js"
}, {
    name: "d",
    url: "./modules/d.js"
}]);

describe('use a', function () {
    myloader.use('a', function (a) {
        it('a loaded', function () {
            chai.assert.equal(a.getv(), 'a');
        });

        console.log('aaa');
    });

    myloader.use(['b', 'c'], function (b, c) {
        it('b+c loaded', function () {
            chai.assert.equal(b.getv(), 'b');
            chai.assert.equal(c.getv(), 'c');
        });
    });

    myloader('d', function (d) {
        it('d loaded', function () {
            chai.assert.equal(d.getv(), 'd');
        });
    });
});

window.addEventListener('load', function () {
    mocha.run();
}, false);
