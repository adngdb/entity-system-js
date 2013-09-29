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
    GameComponent = require('./components/game');

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

exports['create-entity-force-id'] = function (test) {
    // Test that forcing the ID of a new entity works
    var myGE = prepareManager();
    var pos = myGE.e(42, 'Position');

    test.equal(pos.id, 42);
    test.equal(myGE.get('Position').length, 1);

    var pos2 = myGE.e(43, ['Position', 'Unit']);

    test.equal(pos2.id, 43);
    test.equal(myGE.get('Position').length, 2);
    test.equal(myGE.get('Unit').length, 1);

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
    test.equal(myGE.get('UnknownComponent'), null, 'Bad list of entities');

    test.done();
}

exports['get-entity-by-id'] = function (test) {
    // Preparing
    var myGE = prepareManager(),
        pos = myGE.e('Position'),
        unit = myGE.e('Unit');

    test.deepEqual(myGE.get(pos.id), pos, 'Bad entity');
    test.deepEqual(myGE.get(unit.id), unit, 'Bad entity');
    test.equal(myGE.get(12345678), null, 'Return results when it should not');

    test.done();
}

exports['remove-entity'] = function (test) {
    // Preparing
    var myGE = prepareManager(),
        pos = myGE.e('Position');

    // Testing with one entity
    test.deepEqual(myGE.get('Position'), [pos], 'Bad list of entities');
    myGE.removeEntity(pos);
    test.deepEqual(myGE.get('Position'), null, 'Bad list of entities');

    // Testing with two entities
    var pos1 = myGE.e('Position'),
        pos2 = myGE.e('Position');
    test.deepEqual(myGE.get('obj'), [pos1, pos2], 'Bad list of entities');
    myGE.removeEntity(pos1);
    test.deepEqual(myGE.get('obj'), [pos2], 'Bad list of entities');
    myGE.removeEntity(pos2);
    test.deepEqual(myGE.get('obj'), null, 'Bad list of entities');

    test.done();
}

exports['emit-event'] = function (test) {
    var myGE = prepareManager(),
        pos = myGE.e('Position')
        lastEvent = null,
        lastData = null;

    myGE.emit = function(event, data) {
        lastEvent = event;
        lastData = data;
    }

    test.equal(lastEvent, null);
    test.equal(lastData, null);

    pos.x = 12345678;

    test.equal(lastEvent, 'entityChanged');
    test.deepEqual(lastData, { 'entity': pos });

    test.done();
}

exports['several-entities'] = function (test) {
    var myGE = prepareManager();
    myGE.c('Game', GameComponent);

    var g1 = myGE.e('Game');
    var g2 = myGE.e('Game');
    var g3 = myGE.e('Game');
    var u1 = myGE.e('Unit');
    var u2 = myGE.e('Unit');

    u1.attack = 42;
    test.equal(u1.attack, 42);
    test.equal(u2.attack, 10);

    test.equal(g1.units.length, 0);
    test.equal(g2.units.length, 0);
    test.equal(g3.units.length, 0);

    g1.units.push(u1);

    test.equal(g1.units.length, 1);
    test.equal(g2.units.length, 0);
    test.equal(g3.units.length, 0);

    g1.units.push(u2);

    test.equal(g1.units.length, 2);
    test.equal(g2.units.length, 0);
    test.equal(g3.units.length, 0);

    g3.units.push(u1);

    test.equal(g1.units.length, 2);
    test.equal(g2.units.length, 0);
    test.equal(g3.units.length, 1);

    test.done();
}
