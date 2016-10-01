# ensy: Entity System for JavaScript

``ensy`` is a JavaScript implementation of the Entity System model as described by Adam Martin
in his blog post series [Entity Systems are the future of MMOs](http://t-machine.org/index.php/2009/10/26/entity-systems-are-the-future-of-mmos-part-5/).

> Component/Entity Systems are an architectural pattern used mostly in game development. A CES follows the Composition over Inheritance principle to allow for greater flexibility when defining entities (anything that's part of a game's scene: enemies, doors, bullets) by building out of individual parts that can be mixed-and-matched. This eliminates the ambiguity problems of long inheritance chains and promotes clean design. However, CES systems do incur a small cost to performance.

— From the [Entity Systems Wiki](http://entity-systems.wikidot.com/)

## Installation

This module is available on [``npm``](http://npmjs.com/package/ensy) and [``bower``](http://bower.io) as ``ensy``. It has no dependencies.

``npm install --save ensy``

## Usage

```javascript
import EntityManager from 'ensy';

let manager = new EntityManager();

// Create a component and add it to the manager.
const PlayerComponent = {
    name: 'Player',
    description: "The player's state",
    state: {
        life: 100,
        strength: 18,
        charisma: 3,
    }
};
manager.addComponent(PlayerComponent.name, PlayerComponent);

// Create a new entity.
var playerId = manager.createEntity(['Player']);

// Update the player's state:
var playerData = manager.getComponentDataForEntity('Player', playerId);
playerData.life = 80;

// Which is equivalent to:
manager.updateComponentDataForEntity('Player', playerId, {
    life: 80,
});

console.log(playerData);
// { life: 80, strength: 18, charisma: 3 }
}
```

## Documentation

The documentation is available on [Read the docs](https://entity-system-js.readthedocs.io/). All methods are well documented and parameters are described.

For an overall explanation of ``ensy``, you can read my blog post [ensy - Entity System Reloaded](http://adrian.gaudebert.fr/blog/post/2015/07/04/ensy-mdash-entity-system-reloaded).

## Examples

There are examples in the [examples](https://github.com/adngdb/entity-system-js/tree/master/examples) directory:

* [Concentration](https://github.com/adngdb/entity-system-js/tree/master/examples/concentration)
* [Total Madness Arena](https://github.com/adngdb/nth) (Jam game, made in 3 days)
* Made something with ``ensy``? Add it here!

## For developers

Install the dependencies with ``npm install``. The source files are in ``src/``.
The code uses es6 features, and is compiled to es5 using ``babel`` and ``rollup``.

### Building the code

```bash
$ npm run build
```

We use [rollup](http://rollupjs.org/) and [babel](http://babeljs.io/) to
compile the code from es6 to es5, and [uglify](http://lisperator.net/uglifyjs/)
to minify the source code.

### Running tests

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

### Building the API documentation

```bash
$ npm run build_doc
```
