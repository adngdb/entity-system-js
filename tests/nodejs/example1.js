var cem = require('../../component-entity-manager'),
    // Instanciate the Game Engine
    myGE = new cem.ComponentEntityManager();

// Create a few components that can be used in-game
var Hero = {
    "life": 100,
    "defense": 100,
    "attack": 100,

    "hit": function(opponent) {
        var points = this.attack * 1.1 - opponent.defense;

        if (points > 0) {
            opponent.life -= Math.round(points);
        }
        return this;
    },

    "specialHit": function(opponent) {
        return this.hit(opponent);
    }
}

var Wizard = {
    // this component requires the Hero component, and
    // any entity having a Wizard component will automatically have a Hero one
    "_requires": "Hero",

    "life": 80,
    "mana": 100,

    // "Overwrite" the specialHit method of the Hero component
    "specialHit": function(opponent) {
        var points = this.attack * 1.2 - opponent.defense;

        if (this.mana > 20) {
            points += 20;
            this.mana -= 20;
        }

        if (points > 0) {
            opponent.life -= Math.round(points);
        }
        return this;
    }
}

var Necromancer = {
    "_requires": "Wizard",
    "life": 70,
    "attack": 110
}

var Paladin = {
    "_requires": "Hero",
    "defense": 150
}

// Add those components to the Game Engine so we can use them
myGE.addComponent("Hero", Hero)
    .addComponent("Wizard", Wizard)
    .addComponent("Necromancer", Necromancer)
    .addComponent("Paladin", Paladin);

// Create two entities than we can manipulate
var gerard = myGE.e("Paladin"),
    igor = myGE.e("Necromancer");

// And now play with those entities
console.log("Before we do anything: ");
console.log("  Gerard's life is " + gerard.life);
console.log("  Igor's life is " + igor.life);

gerard.hit(igor);

console.log("\nAfter Gerard hits Igor: ");
console.log("  Gerard's life is " + gerard.life);
console.log("  Igor's life is " + igor.life);

igor.specialHit(gerard);

console.log("\nAfter Igor hits Gerard: ");
console.log("  Gerard's life is " + gerard.life);
console.log("  Igor's life is " + igor.life);
