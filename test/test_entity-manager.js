/**
 * Test cases for EntityManager class.
 *
 * Requires node.js and its mocha module.
 * To run those tests: nodeunit tests/test_entity-manager.js
 *
 * @author Adrian Gaudebert - adrian@gaudebert.fr
 */

// for compatibility with node.js and require.js
if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function (require) {
    var chai = require('chai');
    var expect = chai.expect;
    //var assert = chai.assert;
    //var should = chai.should();

    var EntityManager = require('../entity-manager');
    var PositionComponent = require('./components/position');
    var UnitComponent = require('./components/unit');

    function prepareManager() {
        var manager = new EntityManager();
        manager.addComponent('Position', PositionComponent);
        manager.addComponent('Unit', UnitComponent);
        return manager;
    }

    describe('EntityManager', function () {

        describe('#addComponent()', function () {
            it('can add new components', function () {
                var manager = new EntityManager();

                manager.addComponent('Position', PositionComponent);
                expect(manager.getComponentsList()).to.deep.equal(['Position']);

                manager.addComponent('Unit', UnitComponent);
                expect(manager.getComponentsList()).to.deep.equal(['Position', 'Unit']);
            });
        });

        describe('#removeComponent()', function () {
            it('can remove an existing component', function () {
                var manager = prepareManager();
                expect(manager.getComponentsList()).to.deep.equal(['Position', 'Unit']);

                manager.removeComponent('Position');
                expect(manager.getComponentsList()).to.deep.equal(['Unit']);
            });

            it('does not throw an error when trying to remove an unknown component', function () {
                var manager = prepareManager();
                expect(manager.getComponentsList()).to.deep.equal(['Position', 'Unit']);

                manager.removeComponent('UnknownComponent');
                expect(manager.getComponentsList()).to.deep.equal(['Position', 'Unit']);
            });
        });

        describe('#createEntity()', function () {
            it('can create a new single-component entity', function () {
                var manager = prepareManager();

                var entity = manager.createEntity(['Position']);
                var data = manager.getEntityComponent(entity, 'Position');

                // Testing default values
                expect(data.x).to.equal(0);
                expect(data.y).to.equal(0);
                expect(data.z).to.equal(0);
                expect(data.attack).to.be.undefined;
            });

            it('can create a new entity with several components', function () {
                var manager = prepareManager();

                var entity = manager.createEntity(['Position', 'Unit']);
                var dataPos = manager.getEntityComponent(entity, 'Position');
                var dataUnit = manager.getEntityComponent(entity, 'Unit');

                expect(dataPos.x).to.equal(0);
                expect(dataPos.y).to.equal(0);
                expect(dataPos.z).to.equal(0);
                expect(dataPos.attack).to.be.undefined;
                expect(dataPos.unknownattribute).to.be.undefined;

                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.speed).to.equal(1);
                expect(dataUnit.x).to.be.undefined;
            });

            it('throws an exception when creating an entity with unknown components', function () {
                var manager = prepareManager();

                var fn = function() {
                    manager.createEntity(['UnknownComponent']);
                };

                expect(fn).to.throw('Trying to use unknown component: UnknownComponent');
            });
        });

        describe('#addComponentsToEntity()', function () {
            it('can add components to an existing entity', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                manager.addComponentsToEntity(entity, ['Unit']);

                var dataPos = manager.getEntityComponent(entity, 'Position');
                expect(dataPos.x).to.equal(0);
                expect(dataPos.attack).to.be.undefined;

                var dataUnit = manager.getEntityComponent(entity, 'Unit');
                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.x).to.be.undefined;
            });

            it('handles state changes correctly', function () {
                var manager = prepareManager();
                var entity1 = manager.createEntity(['Position', 'Unit']);
                var entity2 = manager.createEntity(['Position', 'Unit']);
                var entity3 = manager.createEntity(['Position']);

                var dataPos = manager.getEntityComponent(entity1, 'Position');
                expect(dataPos.x).to.equal(0);
                expect(dataPos.y).to.equal(0);
                expect(dataPos.z).to.equal(0);

                dataPos.x = 23;

                expect(dataPos.x).to.equal(23);
                expect(dataPos.y).to.equal(0);
                expect(dataPos.z).to.equal(0);

                dataPos.z = 32;

                expect(dataPos.x).to.equal(23);
                expect(dataPos.y).to.equal(0);
                expect(dataPos.z).to.equal(32);

                var dataUnit = manager.getEntityComponent(entity1, 'Unit');
                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.defense).to.equal(5);
                expect(dataUnit.speed).to.equal(1);
                expect(dataUnit.range).to.equal(2);

                dataUnit.speed = 3;

                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.defense).to.equal(5);
                expect(dataUnit.speed).to.equal(3);
                expect(dataUnit.range).to.equal(2);

                var dataPos2 = manager.getEntityComponent(entity2, 'Position');
                expect(dataPos2.x).to.equal(0);
                expect(dataPos2.y).to.equal(0);
                expect(dataPos2.z).to.equal(0);

                var dataPos3 = manager.getEntityComponent(entity3, 'Position');
                expect(dataPos3.x).to.equal(0);
                expect(dataPos3.y).to.equal(0);
                expect(dataPos3.z).to.equal(0);
            });

            it('emits an event when a state changes', function () {
                var manager = prepareManager();
                var events = [];

                // Mock an emit function.
                manager.emit = function (e, arg1, arg2) {
                    events.push([e, arg1, arg2]);
                }

                var entity = manager.createEntity(['Position']);
                manager.addComponentsToEntity(entity, ['Unit']);

                var dataPos = manager.getEntityComponent(entity, 'Position');
                dataPos.x = 43;

                expect(events.length).to.equal(1);
                expect(events[0]).to.deep.equal(['entityComponentUpdated', entity, 'Position']);

                var dataUnit = manager.getEntityComponent(entity, 'Unit');
                dataUnit.speed = 44;
                dataUnit.attack = 42;
                dataUnit.attack = 4;

                expect(events.length).to.equal(4);
                expect(events[1]).to.deep.equal(['entityComponentUpdated', entity, 'Unit']);
                expect(events[2]).to.deep.equal(['entityComponentUpdated', entity, 'Unit']);
                expect(events[3]).to.deep.equal(['entityComponentUpdated', entity, 'Unit']);
            });
        });

        describe('#getEntityComponent()', function () {
            it('returns the correct data object', function () {
                var manager = prepareManager();

                var entity = manager.createEntity(['Position', 'Unit']);
                var dataPos = manager.getEntityComponent(entity, 'Position');
                var dataUnit = manager.getEntityComponent(entity, 'Unit');

                expect(dataPos.x).to.equal(0);
                expect(dataPos.y).to.equal(0);
                expect(dataPos.z).to.equal(0);
                expect(dataPos.attack).to.be.undefined;

                dataPos.x = 12;
                expect(dataPos.x).to.equal(12);

                dataPos.x++;
                expect(dataPos.x).to.equal(13);

                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.speed).to.equal(1);
                expect(dataUnit.x).to.be.undefined;

                dataUnit.speed = 2.5;
                expect(dataUnit.speed).to.equal(2.5);
            });

            it('throws an error when the component does not exist', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position', 'Unit']);

                var fn = function () {
                    manager.getEntityComponent(entity, 'UnknownComponent');
                };

                expect(fn).to.throw('Trying to use unknown component: UnknownComponent');
            });

            it('throws an error when the component has no data', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                var fn = function () {
                    manager.getEntityComponent(entity, 'Unit');
                };

                expect(fn).to.throw('No data for component Unit and entity ' + entity);
            });

            it('throws an error when the entity does not contain the component', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                // Create an entity with the Unit component so it has data.
                manager.createEntity(['Unit']);

                var fn = function () {
                    manager.getEntityComponent(entity, 'Unit');
                };

                expect(fn).to.throw('No data for component Unit and entity ' + entity);
            });
        });

        describe('#removeEntity()', function () {
            it('can remove an existing entity', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                manager.removeEntity(entity);

                var fn = function () {
                    manager.getEntityComponent(entity, 'Position');
                }

                expect(fn).to.throw('No data for component Position and entity ' + entity);
            });

            it('can remove several existing entities', function () {
                var manager = prepareManager();
                var entity1 = manager.createEntity(['Position']);
                var entity2 = manager.createEntity(['Position']);
                var entity3 = manager.createEntity(['Position']);

                manager.removeEntity(entity1);
                manager.removeEntity(entity3);

                var fn1 = function () {
                    manager.getEntityComponent(entity1, 'Position');
                }

                var fn3 = function () {
                    manager.getEntityComponent(entity3, 'Position');
                }

                expect(fn1).to.throw('No data for component Position and entity ' + entity1);
                expect(fn3).to.throw('No data for component Position and entity ' + entity3);

                expect(manager.getEntityComponent(entity2, 'Position')).to.be.ok;
            });
        });
    });
});
