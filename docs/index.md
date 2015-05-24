# Entity System for JavaScript

This is a JavaScript implementation of the Entity System model as described by Adam Martin in his blog post series [Entity Systems are the future of MMOs](http://t-machine.org/index.php/2009/10/26/entity-systems-are-the-future-of-mmos-part-5/).

You can find the [API documentation](api/) here. A more comprehensive documentation is coming, along with a tutorial. [Soon](http://i2.kym-cdn.com/photos/images/facebook/000/117/021/enhanced-buzz-28895-1301694293-0.jpg).

For examples of how to use this library, you can take a look at the [examples folder](https://github.com/AdrianGaudebert/entity-system-js/tree/master/examples) in the code repository. We also have a bigger scale example called [Total Madness Arena](https://github.com/AdrianGaudebert/nth), a game made during a [Game Dev Party Jam](http://gamedevparty.fr).

# General concepts of an Entity System

There are 3 main concepts in the Entity System for JavaScript library, and others that gravitate around them in the Entity System model.

## Entities

Concretely, an Entity is a simple identifier, in our case an integer (though it might become a UUID in the future). Entities do nothing by themselves, but they are associated with a list of components. There is no "Entity object", no Entity data, no Entity state: just a collection of instances of components, and those components are the objects, they contain the data and they have the state.

```javascript
var entity = manager.createEntity(['MyComponent']);
console.log(entity);
// > 1
```


## Components

A Component is a collection of states about an aspect of the game. It has no logic, just data. In this library, Components are objects containing a sub-object called ``state``, and that ``state`` has a list of attributes that all need to be serializable. Strings, numbers and arrays are the most common types there. Functions should never be in a component's ``state``, and objects should not be there either, because if you feel the need to add an object that probably means you actually want to create a different component.

Every time a component is added to an entity, a copy of the ``state`` is created and attached to that entity. You can then freely change all the values of that component's attributes without impacting other entities.

```javascript
var positionComp = {
    name: 'Position',
    state: {
        x: 0,
        y: 0
    }
};
manager.addComponent(positionComp.name, positionComp);

var aPosition = manager.createEntity(['Position']);
var aPositionData = manager.getEntityWithComponent(aPosition, 'Position');
console.log(aPositionData.x);
// > 0
```

Note: the ``state`` key is the only mandatory key in the root of a component. All others keys are metadata that won't be used by the Entity System. They are here for your convenience. For example, I try to always have a ``name`` in my components, and use that when declaring them, as shown in the example above. A ``description`` field could also be a good idea, especially when you start having a lot of components.


## Processors

Components have no logic, so it has to live somewhere else. That's processors. Processors are at the core a simple ``update`` function that is called every frame of your game.

```javascript
var MyProcessor = function (manager) {
    this.manager = manager;
};

MyProcessor.prototype.update = function (dt) {
    var entities = this.manager.getEntitiesWithComponent('MyComponent');

    // Do something on those entities...
};

manager.addProcessor(new MyProcessor(manager));

while (true) {
    manager.update();
}
```


## Assemblages

In a game, you often find yourself creating entities with the same components over and over. Assemblages are here to make that easier. They consist in a list of components, and some initial data to apply to those components. In your game, you can then easily create an entity from an assemblage, and automatically get the right components and the right default data.

```javascript
var MyAssemblage = {
    name: 'SomeUnit',
    components: ['Position', 'Sprite', 'Attack'],
    initialState: {
        Positon: {
            x: 1,
            y: 2
        },
        Sprite: {
            source: 'assets/some-unit.png'
        }
    }
};

manager.addAssemblage(MyAssemblage.name, MyAssemblage);
var entity = manager.createEntityFromAssemblage(MyAssemblage);
```
