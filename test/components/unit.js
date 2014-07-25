// for compatibility with node.js and require.js
if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function () {/**
     * Class UnitComponent
     *
     * @author Adrian Gaudebert - adrian@gaudebert.fr
     * @constructor
     */
    var UnitComponent = {
        name: 'Unit',
        description: 'A basic unit that can attack, defend and move',

        state: {
            attack: 10,
            defense: 5,
            speed: 1,
            range: 2,
        },
    };

    return UnitComponent;
});
