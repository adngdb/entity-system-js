var Benchmark = require('benchmark');
var EntityManager = require('../../entity-manager');

var PositionComponent = require('./../components/position');
var UnitComponent = require('./../components/unit');


var suite = new Benchmark.Suite('General perf tracking');

// add tests
suite.add('EntityManager#general', function() {
    var manager = new EntityManager();

    // Add some components.
    manager.addComponent(PositionComponent.name, PositionComponent);
    manager.addComponent(UnitComponent.name, UnitComponent);

    // Create a bunch of entities.
    for (var i = 0; i < 500; i++) {
        var entity = manager.createEntity(['Position', 'Unit']);
        manager.updateComponentDataForEntity('Position', entity, {
            x: 123,
            y: 42,
        });
        manager.updateComponentDataForEntity('Unit', entity, {
            attack: 23,
        });
    };

    // Create a processor that does dummy things.
    var DummyProcessor = function (manager) {
        this.manager = manager;
    };

    DummyProcessor.prototype.update = function (dt) {
        var units = this.manager.getComponentsData('Unit');

        for (var i = 0; i < units.length; i++) {
            var unit = units[i];
            unit.attack = i;
        };
    };

    manager.addProcessor(new DummyProcessor(manager));

    manager.update(1);
})
// add listeners
.on('cycle', function(event) {
    console.log(String(event.target));
})
.on('complete', function() {
    console.log('done');
})
.run({ 'async': true });
