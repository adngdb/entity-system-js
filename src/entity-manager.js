/*!
 * ensy - Entity System JavaScript Library v1.3.0
 *
 * A JavaScript implementation of the Entity System model as described by
 * Adam Martin in http://t-machine.org/index.php/2009/10/26/entity-systems-are-the-future-of-mmos-part-5/
 *
 * @author Adrian Gaudebert - adrian@gaudebert.fr
 * @license MIT license.
 * @documentation https://entity-system-js.readthedocs.io/
 *
 */

/*!
 * Return a clone of an object.
 * From https://stackoverflow.com/questions/728360
 */
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || 'object' != typeof obj) return obj;

    let copy;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
}

/*!
 * Return true if the parameter is a function.
 * From https://stackoverflow.com/questions/5999998
 */
function isFunction(thingToCheck) {
    return thingToCheck && ({}).toString.call(thingToCheck) === '[object Function]';
}

/**
 * @class EntityManager
 *
 * Implement the Entity System model and provide tools to easily
 * create and manipulate Entities, Components and Processors.
 */
class EntityManager {
    constructor(listener) {
        this.listener = null;
        if (listener && isFunction(listener.emit)) {
            this.listener = listener;
        }

        // A list of entity IDs, each being a simple integer.
        this.entities = [];

        // A dictionary of components, where keys are the name of each
        // component. Components are objects containing:
        //  * metadata (name, description)
        //  * the initial set of data that defines the default state of a
        //    newly instanciated component
        this.components = {};

        // A dictionary of assemblages, where keys are the name of each
        // assemblage. Assemblages are objects containing:
        //  * metadata (name, description)
        //  * a list of components to add to the entity
        //  * an initial state for some components, to override the defaults
        this.assemblages = {};

        /*!
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

        // The ordered list of processors known by this manager.
        this.processors = [];

        // The next unique identifier.
        this.uid = 0;
    }

    /**
     * Return an identifier unique to this system.
     *
     * @return {int} - Unique identifier.
     */
    getUid() {
        return this.uid++;
    }

    //=========================================================================
    // ENTITIES

    /**
     * Create a new entity in the system by creating a new instance of each of
     * its components.
     *
     * @param {array} componentIds - List of identifiers of the components that compose the new entity.
     * @param {int} entityId - Optional. Unique identifier of the entity. If passed, no new id will be generated.
     * @return {int} - Unique identifier of the new entity.
     */
    createEntity(componentIds, entityId) {
        if (typeof entityId === 'undefined' || entityId === null) {
            entityId = this.getUid();
        }
        else if (entityId > this.uid) {
            // Make sure another entity with the same ID won't be created in the future.
            this.uid = entityId;
        }

        this.addComponentsToEntity(componentIds, entityId);
        if (!this.entities.includes(entityId)) {
            this.entities.push(entityId);
        }
        if (this.listener) {
            // Signal the creation of a new entity.
            this.listener.emit('entityCreated', entityId);
        }
        return entityId;
    }

    /**
     * Remove an entity and its instanciated components from the system.
     *
     * @param {int} id - Unique identifier of the entity.
     * @return {object} - this
     */
    removeEntity(id) {
        // Remove all data for this entity.
        for (let comp in this.entityComponentData) {
            if (this.entityComponentData.hasOwnProperty(comp)) {
                if (this.entityComponentData[comp][id]) {
                    delete this.entityComponentData[comp][id];
                }
            }
        }

        // Remove the entity from the list of known entities.
        this.entities.splice(this.entities.indexOf(id), 1);

        if (this.listener) {
            // Signal the removal of an entity.
            this.listener.emit('entityCreated', id);
        }

        return this;
    }

    //=========================================================================
    // COMPONENTS

    /**
     * Add a component to the list of known components.
     *
     * @param {string} id - Unique identifier of the component.
     * @param {object} component - Object containing the metadata and data of the component.
     * @return {object} - this
     */
    addComponent(id, component) {
        this.components[id] = component;
        return this;
    }

    /**
     * Remove a component from the list of known components.
     *
     * @param {string} id - Unique identifier of the component.
     * @return {object} - this
     */
    removeComponent(id) {
        delete this.components[id];
        delete this.entityComponentData[id];
        return this;
    }

    /**
     * Get the list of components this instance knows.
     *
     * @return {array} - List of names of components.
     */
    getComponentsList() {
        return Object.keys(this.components);
    }

    /**
     * Create a new instance of each listed component and associate them
     * with the entity.
     *
     * @param {array} componentIds - List of identifiers of the components to add to the entity.
     * @param {int} entityId - Unique identifier of the entity.
     * @return {object} - this
     */
    addComponentsToEntity(componentIds, entityId) {
        const self = this;

        // First verify that all the components exist, and throw an error
        // if any is unknown.
        componentIds.forEach(comp => {
            if (!this.components[comp]) {
                throw new Error('Trying to use unknown component: ' + comp);
            }
        });

        // Now we know that this request is correct, let's create the new
        // entity and instanciate the component's states.
        componentIds.forEach(comp => {
            if (!this.entityComponentData[comp]) {
                this.entityComponentData[comp] = {};
            }

            let newCompState = null;

            // If the manager has a listener, we want to create getters
            // and setters so that we can emit state changes. But if it does
            // not have one, there is no need to add the overhead.
            if (this.listener) {
                newCompState = {};
                (function (newCompState, comp) {
                    let state = clone(self.components[comp].state);

                    // Create a setter for each state attribute, so we can emit an
                    // event whenever the state of this component changes.
                    for (let property in state) {
                        if (state.hasOwnProperty(property)) {
                            (function (property) {
                                Object.defineProperty(newCompState, property, {
                                    enumerable: true,
                                    get: function () {
                                        return state[property];
                                    },
                                    set: function (val) {
                                        state[property] = val;
                                        self.listener.emit('entityComponentUpdated', entityId, comp);
                                    },
                                });
                            })(property);
                        }
                    }
                })(newCompState, comp);
            }
            else {
                newCompState = clone(self.components[comp].state);
            }

            // Store the entity's ID so it's easier to find other components for that entity.
            newCompState.__id = entityId;

            this.entityComponentData[comp][entityId] = newCompState;

            if (this.listener) {
                // Signal the addition of a new component to the entity.
                this.listener.emit('entityComponentAdded', entityId, comp);
            }
        });

        return this;
    }

    /**
     * De-associate a list of components from the entity.
     *
     * @param {array} componentIds - List of identifiers of the components to remove from the entity.
     * @param {int} entityId - Unique identifier of the entity.
     * @return {object} - this
     */
    removeComponentsFromEntity(componentIds, entityId) {
        // First verify that all the components exist, and throw an error
        // if any is unknown.
        componentIds.forEach(comp => {
            if (!this.components[comp]) {
                throw new Error('Trying to use unknown component: ' + comp);
            }
        });

        // Now we know that this request is correct, let's remove all the
        // components' states for that entity.
        componentIds.forEach(comp => {
            if (this.entityComponentData[comp]) {
                if (this.entityComponentData[comp][entityId]) {
                    delete this.entityComponentData[comp][entityId];
                    if (this.listener) {
                        // Signal the creation of a new entity.
                        this.listener.emit('entityComponentRemoved', entityId, comp);
                    }
                }
            }
        });


        return this;
    }

    /**
     * Return a reference to an object that contains the data of an
     * instanciated component of an entity.
     *
     * @param {int} entityId - Unique identifier of the entity.
     * @param {string} componentId - Unique identifier of the component.
     * @return {object} - Component data of one entity.
     */
    getComponentDataForEntity(componentId, entityId) {
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
    }

    /**
     * Update the state of a component, many keys at once.
     *
     * @param {int} entityId - Unique identifier of the entity.
     * @param {string} componentId - Unique identifier of the component.
     * @param {object} newState - Object containing the new state to apply.
     * @return {object} - this
     */
    updateComponentDataForEntity(componentId, entityId, newState) {
        const compState = this.getComponentDataForEntity(componentId, entityId);

        for (let key in newState) {
            if (newState.hasOwnProperty(key) && compState.hasOwnProperty(key)) {
                compState[key] = newState[key];
            }
        }

        return this;
    }

    /**
     * Return a list of objects containing the data of all of a given component.
     *
     * @param {string} componentId - Unique identifier of the component.
     * @return {array} - List of component data for one component.
     */
    getComponentsData(componentId) {
        if (!(componentId in this.components)) {
            throw new Error('Trying to use unknown component: ' + componentId);
        }

        if (!this.entityComponentData.hasOwnProperty(componentId)) {
            return [];
        }

        const comps = this.entityComponentData[componentId];
        // The components are stored as an object where entities are keys, but
        // we want to return an array.
        return Object.keys(comps).map(key => comps[key]);
    }

    /**
     * Return true if the entity has the component.
     *
     * @param {int} entityId - Unique identifier of the entity.
     * @param {string} componentId - Unique identifier of the component.
     * @return {boolean} - True if the entity has the component.
     */
    entityHasComponent(entityId, componentId) {
        if (!(componentId in this.components)) {
            return false;
        }

        return (
            this.entityComponentData.hasOwnProperty(componentId) &&
            this.entityComponentData[componentId].hasOwnProperty(entityId)
        );
    }

    //=========================================================================
    // ASSEMBLAGES

    /**
     * Add an assemblage to the list of known assemblages.
     *
     * @param {string} id - Unique identifier of the assemblage.
     * @param {object} assemblage - An instance of an assemblage to add.
     * @return {object} - this
     */
    addAssemblage(id, assemblage) {
        this.assemblages[id] = assemblage;
        return this;
    }

    /**
     * Remove an assemblage from the list of known assemblages.
     *
     * @param {string} id - Unique identifier of the assemblage.
     * @return {object} - this
     */
    removeAssemblage(id) {
        delete this.assemblages[id];
        return this;
    }

    /**
     * Create a new entity in the system by creating a new instance of each of
     * its components and setting their initial state, using an assemblage.
     *
     * @param {string} assemblageId - Id of the assemblage to create the entity from.
     * @return {int} - Unique identifier of the new entity.
     */
    createEntityFromAssemblage(assemblageId) {
        if (!(assemblageId in this.assemblages)) {
            throw new Error('Trying to use unknown assemblage: ' + assemblageId);
        }

        const assemblage = this.assemblages[assemblageId];
        const entity = this.createEntity(assemblage.components);

        for (let comp in assemblage.initialState) {
            if (assemblage.initialState.hasOwnProperty(comp)) {
                const newState = assemblage.initialState[comp];
                this.updateComponentDataForEntity(comp, entity, newState);
            }
        }

        return entity;
    }

    //=========================================================================
    // PROCESSORS

    /**
     * Add a processor to the list of known processors.
     *
     * @param {object} processor - An instance of a processor to manage.
     * @return {object} - this
     */
    addProcessor(processor) {
        this.processors.push(processor);
        return this;
    }

    /**
     * Remove a processor from the list of known processors.
     *
     * @param {object} processor - An instance of a processor to remove.
     * @return {object} - this
     */
    removeProcessor(processor) {
        this.processors.splice(this.processors.indexOf(processor), 1);
        return this;
    }

    /**
     * Update all the known processors.
     *
     * @param {int} dt - The time delta since the last call to update. Will be passed as an argument to all processor's `update` method.
     * @return {object} - this
     */
    update(dt) {
        this.processors.forEach(processor => processor.update(dt));
        return this;
    }
}

export default EntityManager;
