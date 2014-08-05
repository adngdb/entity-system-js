/**
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
     * Return a clone of an object.
     * From http://stackoverflow.com/questions/728360
     */
     function clone(obj) {
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    /**
     * Class EntityManager
     *
     * Implement the Entity System model and provide tools to easily
     * create and manipulate Components and Entities.
     *
     * @constructor
     */
    var EntityManager = function () {
        // A list of entity IDs, each being a simple integer.
        this.entities = [];

        // A dictionary of components, where keys are the name of each
        // component. Components are objects containing:
        //  * metadata (name, description)
        //  * the initial set of data that defines the default state of a
        //    newly instanciated component
        this.components = {};

        /**
         * A relational-like list of entity states. There is one line for
         * each entity - component association.
         *
         * To optimize the access time to this data, it is stored in a
         * dictionary of dictionaries of this form:
         * {
         *   "componentId": {
         *     "entityId": {
         *       ...
         *       here comes the state of this entity for this component
         *       ...
         *     }
         *   }
         * }
         *
         * This way, getting the data of one entity for one component is:
         *   this.entityComponentData[componentId][entityId]
         * and getting all entities for one component is:
         *   this.entityComponentData[componentId]
         */
        this.entityComponentData = {};

        // The next unique identifier.
        this.uid = 0;
    };

    /**
     * Add a component to the list of known components.
     *
     * @argument id: string - Unique identifier of the component.
     * @argument component: object - Object containing the metadata and data of the component.
     * @return None.
     */
    EntityManager.prototype.addComponent = function (id, component) {
        this.components[id] = component;
        return this;
    };

    /**
     * Remove a component from the list of known components.
     *
     * @argument id: string - Unique identifier of the component.
     * @return None.
     */
    EntityManager.prototype.removeComponent = function (id) {
        delete this.components[id];
        return this;
    };

    /**
     * Create a new entity in the system by creating a new instance of each of
     * its components.
     *
     * @argument componentIds: list of strings - List of identifiers of the components that compose the new entity.
     * @return int - Unique identifier of the new entity.
     */
    EntityManager.prototype.createEntity = function (componentIds) {
        var id = this.getUid();
        this.addComponentsToEntity(id, componentIds);
        this.entities.push(id);
        return id;
    };

    /**
     * Create a new entity in the system by creating a new instance of each of
     * its components.
     *
     * @argument componentIds: list of strings - List of identifiers of the components that compose the new entity.
     * @return None.
     */
    EntityManager.prototype.addComponentsToEntity = function (entityId, componentIds) {
        var i;
        var comp;
        var self = this;

        // First verify that all the components exist, and throw an error
        // if any is unknown.
        for (i = componentIds.length - 1; i >= 0; i--) {
            comp = componentIds[i];

            if (!this.components[comp]) {
                throw new Error('Trying to use unknown component: ' + comp);
            }
        }

        // Now we know that this request is correct, let's create the new
        // entity and instanciate the component's states.
        for (i = componentIds.length - 1; i >= 0; i--) {
            comp = componentIds[i];

            if (!this.entityComponentData[comp]) {
                this.entityComponentData[comp] = {};
            }

            var newCompState = {};
            (function (newCompState) {
                var state = clone(self.components[comp].state);

                // Create a setter for each state attribute, so we can emit an
                // event whenever the state of this component changes.
                for (var property in state) {
                    if (state.hasOwnProperty(property)) {
                        (function (property) {
                            Object.defineProperty(newCompState, property, {
                                get: function () {
                                    return state[property];
                                },
                                set: function (val) {
                                    state[property] = val;

                                    if (self.emit instanceof Function) {
                                        self.emit('entityComponentUpdated', entityId, comp);
                                    }
                                }
                            });
                        })(property);
                    }
                }
            })(newCompState);

            this.entityComponentData[comp][entityId] = newCompState;
        }

        return this;
    };

    /**
     * Return a reference to an object that contains the data of an
     * instanciated component of an entity.
     *
     * @argument entityId: int - Unique identifier of the entity.
     * @argument componentId: string - Unique identifier of the component.
     * @return Object - Component data of one entity.
     */
    EntityManager.prototype.getEntityWithComponent = function (entityId, componentId) {
        if (!(componentId in this.components)) {
            throw new Error('Trying to use unknown component: ' + componentId);
        }

        if (
            !this.entityComponentData.hasOwnProperty(componentId) ||
            !this.entityComponentData[componentId].hasOwnProperty(entityId)
        ) {
            throw new Error('No data for component ' + componentId + ' and entity ' + entityId);
        }

        return this.entityComponentData[componentId][entityId];
    };

    /**
     * Return a list of objects containing the data of all of a given component.
     *
     * @argument componentId: string - Unique identifier of the component.
     * @return Array - List of component data for all one component.
     */
    EntityManager.prototype.getEntitiesWithComponent = function (componentId) {
        if (!(componentId in this.components)) {
            throw new Error('Trying to use unknown component: ' + componentId);
        }

        if (!this.entityComponentData.hasOwnProperty(componentId)) {
            throw new Error('No data for component ' + componentId);
        }

        return this.entityComponentData[componentId];
    };

    /**
     * Remove an entity and its instanciated components from the system.
     *
     * @argument id: int - Unique identifier of the entity.
     * @return None.
     */
    EntityManager.prototype.removeEntity = function (id) {
        // Remove all data for this entity.
        for (var comp in this.entityComponentData) {
            if (this.entityComponentData.hasOwnProperty(comp)) {
                if (this.entityComponentData[comp][id]) {
                    delete this.entityComponentData[comp][id];
                }
            }
        }

        // Return the entity from the list of known entities.
        this.entities.splice(this.entities.indexOf(id), 1);

        return this;
    };

    /**
     * Get the list of components this instance knows.
     *
     * @return Array - List of names of components.
     */
    EntityManager.prototype.getComponentsList = function () {
        return Object.keys(this.components);
    };

    /**
     * Return an identifier unique to this system.
     *
     * @return int - Unique identifier.
     */
    EntityManager.prototype.getUid = function () {
        return this.uid++;
    };

    return EntityManager;
});
