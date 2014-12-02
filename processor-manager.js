/*!
 * EntityManager JavaScript Library v0.2.0
 *
 * A JavaScript implementation of the Entity System model as described by
 * Adam Martin in http://t-machine.org/index.php/2009/10/26/entity-systems-are-the-future-of-mmos-part-5/
 *
 * @author Adrian Gaudebert - adrian@gaudebert.fr
 * @license MIT license.
 *
 */

// for compatibility with node.js and require.js
if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function () {

    /**
     * @class ProcessorManager
     *
     * Implement the Entity System model and provide tools to easily
     * manipulate Processors for you Entities.
     */
    var ProcessorManager = function () {
        this.processors = [];
    };

    /**
     * Add a processor to the list of known processors.
     *
     * @param {object} processor - An instance of a processor to manage.
     * @return {object} - this
     */
    ProcessorManager.prototype.addProcessor = function (processor) {
        this.processors.push(processor);
        return this;
    };

    /**
     * Update all the known processors.
     *
     * @param {int} dt - The time delta, in miliseconds, since the last call to update.
     * @return {object} - this
     */
    ProcessorManager.prototype.update = function (dt) {
        for (var i = 0; i < this.processors.length; i++) {
            this.processors[i].update(dt);
        }
        return this;
    };

    return ProcessorManager;
});
