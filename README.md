# Entity System for JavaScript

JavaScript implementation of the Entity System model as described by Adam Martin
in his blog post series [Entity Systems are the future of MMOs](http://t-machine.org/index.php/2009/10/26/entity-systems-are-the-future-of-mmos-part-5/).

# Installation

Using [``bower``](http://bower.io):

```bower install ensy```

Using [``npm``](http://npmjs.com):

```npm install ensy```

# Documentation

The documentation is available on [Read the docs](http://entity-system-js.rtfd.org/). All methods are well documented and parameters are described. If you are familiar with Entity Systems, it shouldn't be too hard to understand.

Here is a quick example:

```javascript
require('entity-manager', function (EntityManager)) {
    var manager = new EntityManager();

    var Player = {
        name: 'Player',
        description: "The player's state",
        state: {
            life: 100,
            strength: 18,
            charisma: 3,
        }
    };

    manager.addComponent(Player.name, Player);
    var player = manager.createEntity(['Player']);
    var playerData = manager.getComponentDataForEntity('Player', player);
    playerData.life = 80;
}
```

# Examples

There are examples in the [examples](https://github.com/AdrianGaudebert/component-entity/tree/master/examples) directory:

* [Concentration](https://github.com/AdrianGaudebert/component-entity/tree/master/examples/concentration)
* [Total Madness Arena](https://github.com/AdrianGaudebert/nth)
* more to come...

# For developers

Install the dependencies with ``npm install``.

## Running tests

```bash
$ npm test
```

To run the tests in your browser:

```bash
$ make test-browser
```

## Building the documentation

```bash
$ npm run build_doc
```
