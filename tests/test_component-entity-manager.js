var ComponentEntityManager = require('../component-entity-manager'),
    PositionComponent = require('./components/position');
    UnitComponent = require('./components/unit');

var cem = new ComponentEntityManager();
cem.c('Position', PositionComponent);
cem.c('Unit', UnitComponent);

var pos = cem.e('Unit');
console.log("pos : " + pos);
console.log("pos.x : " + pos.x);

pos.x = 45;
console.log("pos.x : " + pos.x);

var pos2 = cem.e('Position');
console.log("pos2 : " + pos2);
console.log("pos2.x : " + pos2.x);
console.log("pos.x : " + pos.x);

console.log("pos.isAtOrigin : " + pos.isAtOrigin());
console.log("pos2 : " + pos2.x + ", " + pos2.y + ", " + pos2.z);
console.log("pos2.isAtOrigin : " + pos2.isAtOrigin());

console.log("pos.attack : " + pos.attack);
console.log("pos2.attack : " + pos2.attack);

console.log("Position: " + cem.get("Position"));
console.log("Unit: " + cem.get("Unit"));
console.log("obj: " + cem.get("obj"));
console.log("obj Position: " + cem.get("obj Position"));
console.log("obj Unit: " + cem.get("obj Unit"));
