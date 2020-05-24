/* globals describe require module it */

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
    var define = require('amdefine')(module);
}

define(function (require) {
    var chai = require('chai');
    var expect = chai.expect;

    var EntityManager = require('../entity-manager');
    var PositionComponent = require('./components/position');
    var UnitComponent = require('./components/unit');
    var SoldierAssemblage = require('./assemblages/soldier');

    function prepareManager(listener) {
        var manager = new EntityManager(listener);
        manager.addComponent('Position', PositionComponent);
        manager.addComponent('Unit', UnitComponent);
        return manager;
    }

    describe('EntityManager', function () {

        //=====================================================================
        // ENTITIES

        describe('#createEntity()', function () {
            it('can create a new single-component entity', function () {
                var manager = prepareManager();

                var entity = manager.createEntity(['Position']);
                var data = manager.getComponentDataForEntity('Position', entity);

                // Testing default values
                expect(data.x).to.equal(0);
                expect(data.y).to.equal(0);
                expect(data.z).to.equal(0);
                expect(data.attack).to.be.undefined;
            });

            it('can create a new entity with several components', function () {
                var manager = prepareManager();

                var entity = manager.createEntity(['Position', 'Unit']);
                var dataPos = manager.getComponentDataForEntity('Position', entity);
                var dataUnit = manager.getComponentDataForEntity('Unit', entity);

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

            it('can create an entity with a specific UID', function () {
                var manager = prepareManager();
                var newEntityId = 42;

                var entity = manager.createEntity(['Position'], newEntityId);
                expect(entity).to.equal(newEntityId);

                // Testing default values
                var data = manager.getComponentDataForEntity('Position', entity);
                expect(data.x).to.equal(0);

                // Verify the internal UID number has changed to avoid conflicts.
                expect(manager.uid).to.equal(newEntityId);
            });

            it('can override an existing entity', function () {
                var manager = prepareManager();
                var newEntityId = 42;

                var entity = manager.createEntity(['Position'], newEntityId);
                expect(entity).to.equal(newEntityId);
                expect(manager.entityHasComponent(entity, 'Position')).to.be.true;
                expect(manager.entityHasComponent(entity, 'Unit')).to.be.false;

                entity = manager.createEntity(['Position', 'Unit'], newEntityId);
                expect(entity).to.equal(newEntityId);
                expect(manager.entityHasComponent(entity, 'Position')).to.be.true;
                expect(manager.entityHasComponent(entity, 'Unit')).to.be.true;
            });

            it('create event is raised from the manager to the processor', function () {
                var manager = prepareManager();
                var newEntityId = 42;

                var processor = {
                    entities: [],
                    on(type, data) {
                        switch (type) {
                            case 'COMPONENT_CREATED':
                                this.entities.push(data.entity);
                                break;
                            default:
                                break;
                        }
                    },
                    update: function () {},
                };
                manager.addProcessor(processor);

                var entity = manager.createEntity(['Position'], newEntityId);

                expect(manager.processors).to.have.length(1);
                expect(manager.processors[0]).to.equal(processor);
                expect(manager.processors[0].entities).to.have.length(1);
                expect(manager.processors[0].entities[0]).to.equal(newEntityId);
            });

            it('update event is raised from the manager to the processor', function () {
                var manager = prepareManager();
                var newEntityId = 42;

                var processor = {
                    entities: [],
                    on(type, data) {
                        switch (type) {
                            case 'COMPONENT_UPDATED':
                                this.entities.push(data.entity);
                                break;
                            default:
                                break;
                        }
                    },
                    update: function () {},
                };
                manager.addProcessor(processor);

                var entity = manager.createEntity(['Position'], newEntityId);

                expect(manager.processors).to.have.length(1);
                expect(manager.processors[0]).to.equal(processor);
                expect(manager.processors[0].entities).to.have.length(0);

                manager.updateComponentDataForEntity('Position', entity, {
                    x: 12,
                });

                expect(manager.processors[0].entities).to.have.length(1);
                expect(manager.processors[0].entities[0]).to.equal(newEntityId);
            });
        });

        describe('#removeEntity()', function () {
            it('can remove an existing entity', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position', 'Unit']);

                // Verify all data was correctly created.
                var data = manager.getComponentDataForEntity('Position', entity);
                expect(data).to.be.instanceOf(Object);

                data = manager.getComponentDataForEntity('Unit', entity);
                expect(data).to.be.instanceOf(Object);

                manager.removeEntity(entity);

                // Verify all data does not exist anymore.
                expect(function () {
                    manager.getComponentDataForEntity('Position', entity);
                }).to.throw('No data for component Position and entity ' + entity);

                expect(function () {
                    manager.getComponentDataForEntity('Unit', entity);
                }).to.throw('No data for component Unit and entity ' + entity);

                expect(manager.entities).to.not.include(entity);
            });

            it('can remove several existing entities', function () {
                var manager = prepareManager();
                var entity1 = manager.createEntity(['Position']);
                var entity2 = manager.createEntity(['Position']);
                var entity3 = manager.createEntity(['Position']);

                manager.removeEntity(entity1);
                manager.removeEntity(entity3);

                var fn1 = function () {
                    manager.getComponentDataForEntity('Position', entity1);
                };

                var fn3 = function () {
                    manager.getComponentDataForEntity('Position', entity3);
                };

                expect(fn1).to.throw('No data for component Position and entity ' + entity1);
                expect(fn3).to.throw('No data for component Position and entity ' + entity3);

                expect(manager.getComponentDataForEntity('Position', entity2)).to.be.ok;

                expect(manager.entities).to.not.include(entity1);
                expect(manager.entities).to.not.include(entity3);
                expect(manager.entities).to.include(entity2);
            });
        });

        //=====================================================================
        // COMPONENTS

        describe('#addComponent()', function () {
            it('can add new components', function () {
                var manager = new EntityManager();

                manager.addComponent('Position', PositionComponent);
                expect(manager.getComponentsList()).to.deep.equal(['Position']);

                manager.addComponent('Unit', UnitComponent);
                expect(manager.getComponentsList()).to.deep.equal(['Position', 'Unit']);
            });
        });

        describe('#addComponents()', function () {
            it('can add a list of components at once', function () {
                var manager = new EntityManager();

                manager.addComponents([PositionComponent, UnitComponent]);
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

        describe('#addComponentsToEntity()', function () {
            it('adds the entity\'s ID to the state', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                manager.addComponentsToEntity(['Unit'], entity);

                var dataPos = manager.getComponentDataForEntity('Position', entity);
                expect(dataPos.__id).to.exist;
                expect(dataPos.__id).to.equal(entity);

                dataPos = manager.getComponentDataForEntity('Unit', entity);
                expect(dataPos.__id).to.exist;
                expect(dataPos.__id).to.equal(entity);
            });

            it('can add components to an existing entity', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                manager.addComponentsToEntity(['Unit'], entity);

                var dataPos = manager.getComponentDataForEntity('Position', entity);
                expect(dataPos.x).to.equal(0);
                expect(dataPos.attack).to.be.undefined;

                var dataUnit = manager.getComponentDataForEntity('Unit', entity);
                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.x).to.be.undefined;
            });

            it('handles state changes correctly', function () {
                var manager = prepareManager();
                var entity1 = manager.createEntity(['Position', 'Unit']);
                var entity2 = manager.createEntity(['Position', 'Unit']);
                var entity3 = manager.createEntity(['Position']);

                var dataPos = manager.getComponentDataForEntity('Position', entity1);
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

                var dataUnit = manager.getComponentDataForEntity('Unit', entity1);
                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.defense).to.equal(5);
                expect(dataUnit.speed).to.equal(1);
                expect(dataUnit.range).to.equal(2);

                dataUnit.speed = 3;

                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.defense).to.equal(5);
                expect(dataUnit.speed).to.equal(3);
                expect(dataUnit.range).to.equal(2);

                var dataPos2 = manager.getComponentDataForEntity('Position', entity2);
                expect(dataPos2.x).to.equal(0);
                expect(dataPos2.y).to.equal(0);
                expect(dataPos2.z).to.equal(0);

                var dataPos3 = manager.getComponentDataForEntity('Position', entity3);
                expect(dataPos3.x).to.equal(0);
                expect(dataPos3.y).to.equal(0);
                expect(dataPos3.z).to.equal(0);
            });

            it('emits the right component id', function () {
                // Mock a listener object.
                var listener = {
                    events: [],
                    emit: function(e, arg1, arg2) {
                        this.events.push([e, arg1, arg2]);
                    },
                };

                var manager = prepareManager(listener);
                var entity = manager.createEntity(['Position', 'Unit']);

                manager.updateComponentDataForEntity('Position', entity, {
                    x: 12,
                });
                expect(listener.events.pop()).to.deep.equal(['entityComponentUpdated', entity, 'Position']);

                manager.updateComponentDataForEntity('Unit', entity, {
                    speed: 1,
                });
                expect(listener.events.pop()).to.deep.equal(['entityComponentUpdated', entity, 'Unit']);
            });

            it('emits an event when a state changes', function () {
                // Mock a listener object.
                var listener = {
                    events: [],
                    emit: function(e, arg1, arg2) {
                        this.events.push([e, arg1, arg2]);
                    },
                };

                var manager = prepareManager(listener);

                var entity = manager.createEntity(['Position']);
                manager.addComponentsToEntity(['Unit'], entity);

                var dataPos = manager.getComponentDataForEntity('Position', entity);

                // Verify we have 3 events beforehand.
                expect(listener.events.length).to.equal(3);
                dataPos.x = 43;

                expect(listener.events.length).to.equal(4);
                expect(listener.events[3]).to.deep.equal(['entityComponentUpdated', entity, 'Position']);

                // Reinitialize listener object.
                listener.events = [];

                var dataUnit = manager.getComponentDataForEntity('Unit', entity);
                dataUnit.speed = 44;
                dataUnit.attack = 42;
                dataUnit.attack = 4;

                expect(listener.events.length).to.equal(3);
                expect(listener.events[0]).to.deep.equal(['entityComponentUpdated', entity, 'Unit']);
                expect(listener.events[1]).to.deep.equal(['entityComponentUpdated', entity, 'Unit']);
                expect(listener.events[2]).to.deep.equal(['entityComponentUpdated', entity, 'Unit']);
            });

            it('works with no emit function in the manager', function () {
                var manager = prepareManager();

                // Remove the emit function.
                manager.emit = null;

                var entity = manager.createEntity(['Position']);
                manager.addComponentsToEntity(['Unit'], entity);

                var dataPos = manager.getComponentDataForEntity('Position', entity);
                expect(dataPos.x).to.equal(0);
                dataPos.x = 43;
                expect(dataPos.x).to.equal(43);
            });
        });

        describe('#removeComponentsFromEntity()', function () {
            it('removes one component from an existing entity', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position', 'Unit']);

                manager.removeComponentsFromEntity(['Unit'], entity);

                // Verify the 'Position' component is still here.
                var dataPos = manager.getComponentDataForEntity('Position', entity);
                expect(dataPos).to.be.instanceOf(Object);

                // Verify the 'Unit' component has been removed.
                expect(function () {
                    manager.getComponentDataForEntity('Unit', entity);
                }).to.throw('No data for component Unit and entity ' + entity);
            });

            it('removes several components from an existing entity', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position', 'Unit']);

                manager.removeComponentsFromEntity(['Position', 'Unit'], entity);

                // Verify the 'Position' component has been removed.
                expect(function () {
                    manager.getComponentDataForEntity('Position', entity);
                }).to.throw('No data for component Position and entity ' + entity);

                // Verify the 'Unit' component has been removed.
                expect(function () {
                    manager.getComponentDataForEntity('Unit', entity);
                }).to.throw('No data for component Unit and entity ' + entity);
            });
        });

        describe('#getComponentDataForEntity()', function () {
            it('returns the correct data object', function () {
                var manager = prepareManager();

                var entity = manager.createEntity(['Position', 'Unit']);
                var dataPos = manager.getComponentDataForEntity('Position', entity);
                var dataUnit = manager.getComponentDataForEntity('Unit', entity);

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
                    manager.getComponentDataForEntity('UnknownComponent', entity);
                };

                expect(fn).to.throw('Trying to use unknown component: UnknownComponent');
            });

            it('throws an error when the component has no data', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                var fn = function () {
                    manager.getComponentDataForEntity('Unit', entity);
                };

                expect(fn).to.throw('No data for component Unit and entity ' + entity);
            });

            it('throws an error when the entity does not contain the component', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                // Create an entity with the Unit component so it has data.
                manager.createEntity(['Unit']);

                var fn = function () {
                    manager.getComponentDataForEntity('Unit', entity);
                };

                expect(fn).to.throw('No data for component Unit and entity ' + entity);
            });
        });

        describe('#updateComponentDataForEntity()', function () {
            it('updates the data correctly', function () {
                var manager = prepareManager();

                var entity = manager.createEntity(['Position', 'Unit']);
                var dataPos = manager.getComponentDataForEntity('Position', entity);
                var dataUnit = manager.getComponentDataForEntity('Unit', entity);

                expect(dataPos.x).to.equal(0);
                expect(dataPos.y).to.equal(0);
                expect(dataPos.z).to.equal(0);
                expect(dataPos.attack).to.be.undefined;

                manager.updateComponentDataForEntity('Position', entity, {x: 12});

                expect(dataPos.x).to.equal(12);

                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.speed).to.equal(1);
                expect(dataUnit.x).to.be.undefined;

                manager.updateComponentDataForEntity('Unit', entity, {attack: 12, speed: 2.5, x: 1});

                expect(dataUnit.attack).to.equal(12);
                expect(dataUnit.speed).to.equal(2.5);
                expect(dataUnit.x).to.be.undefined;
            });

            it('throws an error when the component does not exist', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position', 'Unit']);

                var fn = function () {
                    manager.updateComponentDataForEntity('UnknownComponent', entity, {});
                };

                expect(fn).to.throw('Trying to use unknown component: UnknownComponent');
            });

            it('throws an error when the component has no data', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                var fn = function () {
                    manager.updateComponentDataForEntity('Unit', entity, {});
                };

                expect(fn).to.throw('No data for component Unit and entity ' + entity);
            });

            it('throws an error when the entity does not contain the component', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                // Create an entity with the Unit component so it has data.
                manager.createEntity(['Unit']);

                var fn = function () {
                    manager.updateComponentDataForEntity('Unit', entity, {});
                };

                expect(fn).to.throw('No data for component Unit and entity ' + entity);
            });
        });

        describe('#getComponentsData()', function () {
            it('returns the correct array', function () {
                var manager = prepareManager();

                manager.createEntity(['Position']);
                manager.createEntity(['Position']);
                manager.createEntity(['Position']);
                manager.createEntity(['Unit']);

                var allPositions = manager.getComponentsData('Position');
                expect(Object.keys(allPositions)).to.have.length(3);

                var allUnits = manager.getComponentsData('Unit');
                expect(Object.keys(allUnits)).to.have.length(1);
            });

            it('throws an error when the component does not exist', function () {
                var manager = prepareManager();
                manager.createEntity(['Position', 'Unit']);

                var fn = function () {
                    manager.getComponentsData('UnknownComponent');
                };

                expect(fn).to.throw('Trying to use unknown component: UnknownComponent');
            });

            it('returns an empty object when the component has no data', function () {
                var manager = prepareManager();
                manager.createEntity(['Position']);

                var components = manager.getComponentsData('Unit');

                expect(components).to.be.an('object').that.is.empty;
            });
        });

        describe('#entityHasComponent()', function () {
            it('returns true when an entity has a component', function () {
                var manager = prepareManager();
                var entity = manager.createEntity(['Position']);

                expect(manager.entityHasComponent(entity, 'Position')).to.be.true;
                expect(manager.entityHasComponent(entity, 'Unit')).to.be.false;
            });
        });

        //=====================================================================
        // ASSEMBLAGES

        describe('#addAssemblage()', function () {
            it('can add new assemblages', function () {
                var manager = new EntityManager();

                manager.addAssemblage('Soldier', SoldierAssemblage);
                expect(Object.keys(manager.assemblages)).to.deep.equal(['Soldier']);

                var someAssemblage = {
                    components: ['Position'],
                    initialState: {},
                };

                manager.addAssemblage('Something', someAssemblage);
                expect(Object.keys(manager.assemblages)).to.deep.equal(['Soldier', 'Something']);
            });
        });

        describe('#addAssemblages()', function () {
            it('can add a list of assemblages', function () {
                var manager = new EntityManager();

                var FakeAssemblage = {
                    name: 'Fake',
                };
                manager.addAssemblages([SoldierAssemblage, FakeAssemblage]);
                expect(Object.keys(manager.assemblages)).to.deep.equal(['Soldier', 'Fake']);
            });
        });

        describe('#removeAssemblage()', function () {
            it('can remove an existing assemblage', function () {
                var manager = prepareManager();
                var someAssemblage = {
                    components: ['Position'],
                    initialState: {},
                };

                manager.addAssemblage('Soldier', SoldierAssemblage);
                manager.addAssemblage('Something', someAssemblage);
                expect(Object.keys(manager.assemblages)).to.deep.equal(['Soldier', 'Something']);

                manager.removeAssemblage('Soldier');
                expect(Object.keys(manager.assemblages)).to.deep.equal(['Something']);

                manager.removeAssemblage('Something');
                expect(Object.keys(manager.assemblages)).to.have.length(0);
            });

            it('does not throw an error when trying to remove an unknown assemblage', function () {
                var manager = prepareManager();
                manager.addAssemblage('Soldier', SoldierAssemblage);
                expect(Object.keys(manager.assemblages)).to.deep.equal(['Soldier']);

                manager.removeAssemblage('Unknown');
                expect(Object.keys(manager.assemblages)).to.deep.equal(['Soldier']);
            });
        });

        describe('#createEntityFromAssemblage()', function () {
            it('correctly creates a new entity from an assemblage', function () {
                var manager = prepareManager();
                manager.addAssemblage('Soldier', SoldierAssemblage);

                var entity = manager.createEntityFromAssemblage('Soldier');

                var dataPos = manager.getComponentDataForEntity('Position', entity);
                var dataUnit = manager.getComponentDataForEntity('Unit', entity);

                expect(dataPos.x).to.equal(15);
                expect(dataPos.y).to.equal(0);
                expect(dataPos.z).to.equal(-1);
                expect(dataPos.attack).to.be.undefined;
                expect(dataPos.unknownattribute).to.be.undefined;

                expect(dataUnit.attack).to.equal(10);
                expect(dataUnit.speed).to.equal(1);
                expect(dataUnit.x).to.be.undefined;
            });
        });

        //=====================================================================
        // PROCESSORS

        describe('#addProcessor()', function () {
            it('adds the processor to the list of processors', function () {
                var manager = prepareManager();
                expect(manager.processors).to.have.length(0);

                var processor = {
                    update: function () {},
                };
                manager.addProcessor(processor);

                expect(manager.processors).to.have.length(1);
            });
        });

        describe('#addProcessors()', function () {
            it('adds a list of processors', function () {
                var manager = prepareManager();
                expect(manager.processors).to.have.length(0);

                var processorA = {
                    update: function () {},
                };
                var processorB = {
                    update: function () {},
                };
                manager.addProcessors([processorA, processorB]);

                expect(manager.processors).to.have.length(2);
            });
        });

        describe('#removeProcessor()', function () {
            it('removes the processor from the list of processors', function () {
                var manager = prepareManager();
                expect(manager.processors).to.have.length(0);

                var processor1 = {
                    update: function () {},
                };
                manager.addProcessor(processor1);

                var processor2 = {
                    update: function () {},
                };
                manager.addProcessor(processor2);

                expect(manager.processors).to.have.length(2);

                manager.removeProcessor(processor1);
                expect(manager.processors).to.have.length(1);
                expect(manager.processors).to.deep.equal([processor2]);
            });
        });

        describe('#update()', function () {
            it('updates all the processors in the list', function () {
                var manager = prepareManager();

                var callCount1 = 0;
                var callCount2 = 0;

                var processor1 = {
                    update: function () {
                        callCount1++;
                    },
                };
                manager.addProcessor(processor1);
                manager.update();

                expect(callCount1).to.equal(1);
                expect(callCount2).to.equal(0);

                var processor2 = {
                    update: function () {
                        callCount2++;
                    },
                };
                manager.addProcessor(processor2);
                manager.update();

                expect(callCount1).to.equal(2);
                expect(callCount2).to.equal(1);

                manager.removeProcessor(processor1);
                manager.update();

                expect(callCount1).to.equal(2);
                expect(callCount2).to.equal(2);
            });
        });
    });
});
