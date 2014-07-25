// for compatibility with node.js and require.js
if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function () {
    /**
     * Class PositionComponent
     *
     * @author Adrian Gaudebert - adrian@gaudebert.fr
     * @constructor
     */
    var PositionComponent = {
        name: 'Position',
        description: '3 dimensional coordinates',

        state: {
            x: 0,
            y: 0,
            z: 0,
        },
    };

    return PositionComponent;
});
