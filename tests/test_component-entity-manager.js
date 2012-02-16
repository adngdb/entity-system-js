/**
 * Test cases for ComponentEntityManager class.
 *
 * Requires node.js and it's nodeunit module.
 * To run those tests: nodeunit tests/test_component-entity-manager.js
 *
 * @author Adrian Gaudebert - adrian@gaudebert.fr
 */

var cem = require('../component-entity-manager'),
    PositionComponent = require('./components/position');
    UnitComponent = require('./components/unit');

function prepareManager() {
    var myGE = new cem.ComponentEntityManager();
    myGE.c('Position', PositionComponent);
    myGE.c('Unit', UnitComponent);
    return myGE;
}

exports['add-component'] = function (test) {
    // One component case
    var myGE = new cem.ComponentEntityManager();
    myGE.c('Position', PositionComponent);

    test.deepEqual(myGE.getComponentsList(), ['obj', 'Position'], 'Bad list of components');

    // Two components case
    myGE.c('Unit', UnitComponent);
    test.deepEqual(myGE.getComponentsList(), ['obj', 'Position', 'Unit'], 'Bad list of components');

    test.done();
}

exports['create-entity'] = function (test) {
    // Preparing
    var myGE = prepareManager(),
        pos = myGE.e('Position');

    // Testing default values
    test.equal(pos.x, 0, 'Bad value for attribute `x`');
    test.equal(pos.y, 0, 'Bad value for attribute `y`');
    test.equal(pos.z, 0, 'Bad value for attribute `z`');
    test.equal(pos.attack, undefined, 'Attribute `attack` should not exist');
    test.equal(pos.unknownattribute, undefined, 'Attribute `unknownattribute` should not exist');

    pos.x = 12;
    test.equal(pos.x, 12, 'Bad value for attribute `x`');

    pos.set('x', 13);
    test.equal(pos.x, 13, 'Bad value for attribute `x`');

    pos.x++;
    test.equal(pos.x, 14, 'Bad value for attribute `x`');
    test.equal(pos.get('x'), 14, 'get() method returns wrong result for attribute `x`');

    // Testing an other entity
    var unit = myGE.e('Unit');

    test.equal(unit.x, 0, 'Bad value for attribute `x`');
    test.equal(unit.y, 0, 'Bad value for attribute `y`');
    test.equal(unit.z, 0, 'Bad value for attribute `z`');
    test.equal(unit.attack, 10, 'Bad value for attribute: attack');
    test.equal(unit.speed, 1, 'Bad value for attribute: speed');

    // Testing methods
    pos.x = 0;
    test.ok(pos.isAtOrigin(), 'Cannot call method isAtOrigin() of Position entity');
    test.ok(unit.isAtOrigin(), 'Cannot call method isAtOrigin() of Unit entity');
    test.ok(unit.canReach(), 'Cannot call method canReach() of Unit entity');

    test.done();
}

exports['create-entity-fail'] = function (test) {
    // Test that creating an entity fails in appropriate situations
    var myGE = prepareManager();

    test.throws(function() { var unknown = myGE.e('UnknownComponent') }, 'Trying to use unknown component: "UnknownComponent"');

    test.done();
}

exports['get-entity'] = function (test) {
    // Preparing
    var myGE = prepareManager(),
        pos = myGE.e('Position');

    // Testing with one entity
    test.deepEqual(myGE.get('Position'), [pos], 'Bad list of entities');

    // Testing with two entities
    var unit = myGE.e('Unit');

    test.deepEqual(myGE.get('Unit'), [unit], 'Bad list of entities');
    test.deepEqual(myGE.get('obj Unit'), [unit], 'Bad list of entities');
    test.deepEqual(myGE.get('obj Position Unit'), [unit], 'Bad list of entities');
    test.deepEqual(myGE.get('Position'), [pos, unit], 'Bad list of entities');
    test.deepEqual(myGE.get('obj Position'), [pos, unit], 'Bad list of entities');
    test.deepEqual(myGE.get('obj'), [pos, unit], 'Bad list of entities');

    test.done();
}

exports['get-entity-by-id'] = function (test) {
    // Preparing
    var myGE = prepareManager(),
        pos = myGE.e('Position'),
        unit = myGE.e('Unit');

    //~ test.deepEqual(myGE.get(pos.id), [pos], 'Bad entity'); // Not ready yet
    //~ test.deepEqual(myGE.get(unit.id), [unit], 'Bad entity'); // Not ready yet

    test.done();
}

exports['remove-entity'] = function (test) {
    // Preparing
    var myGE = prepareManager(),
        pos = myGE.e('Position');

    // Testing with one entity
    test.deepEqual(myGE.get('Position'), [pos], 'Bad list of entities');
    myGE.removeEntity(pos);
    test.deepEqual(myGE.get('Position'), [], 'Bad list of entities');

    // Testing with two entities
    var pos1 = myGE.e('Position'),
        pos2 = myGE.e('Position');
    test.deepEqual(myGE.get('obj'), [pos1, pos2], 'Bad list of entities');
    myGE.removeEntity(pos1);
    test.deepEqual(myGE.get('obj'), [pos2], 'Bad list of entities');
    myGE.removeEntity(pos2);
    test.deepEqual(myGE.get('obj'), [], 'Bad list of entities');

    test.done();
}
