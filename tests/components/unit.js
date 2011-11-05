/**
 * Class UnitComponent
 *
 * @author Adrian Gaudebert - adrian@gaudebert.fr
 * @constructor
 */
var UnitComponent = {

    "_requires": "Position",

    "attack": 10,
    "defense": 5,
    "speed": 1,
    "range": 2,

    "canReach": function(unit) {
        return true;
    }
};

module.exports = UnitComponent;
