/**
 * Class PositionComponent
 *
 * @author Adrian Gaudebert - adrian@gaudebert.fr
 * @constructor
 */
var PositionComponent = {

    "x": 0,
    "y": 0,
    "z": 0,

    "isAtOrigin": function() {
        return this.x === 0 && this.y === 0 && this.z === 0;
    }
};

module.exports = PositionComponent;
