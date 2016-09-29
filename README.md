# Entity System for JavaScript

JavaScript implementation of the Entity System model as described by Adam Martin
in his blog post series [Entity Systems are the future of MMOs](http://t-machine.org/index.php/2009/10/26/entity-systems-are-the-future-of-mmos-part-5/).

# Installation

Using [``npm``](http://npmjs.com):

``npm install ensy`` or ``npm i -d ensy``

Using [``bower``](http://bower.io):

``bower install ensy``

# Documentation

The documentation is available on [Read the docs](https://entity-system-js.readthedocs.io/). All methods are well documented and parameters are described. If you are familiar with Entity Systems, it shouldn't be too hard to understand.

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

    // Update the player's state:
    var playerData = manager.getComponentDataForEntity('Player', player);
    playerData.life = 80;

    // Which is equivalent to:
    manager.updateComponentDataForEntity('Player', player, {
        life: 80,
    });

    console.log(playerData);
    // { life: 80, strength: 18, charisma: 3 }
}
```

# Examples

There are examples in the [examples](https://github.com/adngdb/entity-system-js/tree/master/examples) directory:

* [Concentration](https://github.com/adngdb/entity-system-js/tree/master/examples/concentration)
* [Total Madness Arena](https://github.com/adngdb/nth)
* more to come...

# For developers

Install the dependencies with ``npm install``. The source files are in ``src/``.
The code uses es6 features, and is compiled to es5 using babel.

## Building the code

```bash
$ npm run build
```

We use [rollup](http://rollupjs.org/) and [babel](http://babeljs.io/) to
compile the code from es6 to es5, and [uglify](http://lisperator.net/uglifyjs/)
to minify the source code.

## Running tests

```bash
$ npm test
```

To have tests watch your files and re-run when they change:

```bash
$ npm run test-w
```

To run the tests in your browser:

```bash
$ npm run test-browser
```

## Building the documentation

```bash
$ npm run build_doc
```
