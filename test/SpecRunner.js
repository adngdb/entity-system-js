// Specs to run unit tests in a browser.

requirejs.config({
    baseUrl: '..',
    paths: {
        'lib': '../lib',
        'mocha': 'node_modules/mocha/mocha',
        'chai': 'node_modules/chai/chai',
    },
});

require(['require', 'chai', 'mocha'], function(require, chai) {
    /*globals mocha */
    mocha.setup('bdd');

    require([
        'test/test_entity-manager',
    ], function(require) {
        mocha.run();
    });

});
