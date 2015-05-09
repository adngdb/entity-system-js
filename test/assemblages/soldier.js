// for compatibility with node.js and require.js
if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define({
    name: 'Soldier',
    description: 'A special unit that has a position',
    components: ['Position', 'Unit'],
    initialState: {
        'Position': {
            x: 15,
            z: -1
        }
    }
});
