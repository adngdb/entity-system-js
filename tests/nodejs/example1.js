var util = require('util'),
    ComponentEntityManager = require('../../component-entity-manager');

var myGE = new ComponentEntityManager();

var Hero = {
    "life": 100,
    "defense": 100,
    "attack": 100
}

var Wizard = {
    "_requires": "Hero",
    "life": 80,
    "mana": 100
}

var Necromancer = {
    "_requires": "Wizard",
    "life": 70
}

var Paladin = {
    "_requires": "Hero",
    "defense": 150
}

myGE.addComponent("Hero", Hero)
    .addComponent("Wizard", Wizard)
    .addComponent("Necromancer", Necromancer)
    .addComponent("Paladin", Paladin);

var gerard = myGE.e("Paladin"),
    igor = myGE.e("Necromancer");

console.log("gerard = " + util.inspect(gerard));
console.log("gerard.life = " + gerard.life);
