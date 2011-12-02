/**
 * Class EntityComponentManager
 *
 * Implement the Component / Entity system and provide tools to easily
 * create and manipulate Components and Entities.
 *
 * Inspired by Crafty.js - http://craftyjs.com
 *
 * @author Adrian Gaudebert - adrian@gaudebert.fr
 * @constructor
 */
function EntityComponentManager() {
    var GUID = 0,
        entities = {},
        components = {};

    /**
     * Transform a string into a list of selectors.
     * Split the string by spaces.
     *
     * @return Array of strings.
     */
    function prepareSelectors(selector) {
        if (typeof(selector) == "string") {
            selector = selector.split(" ");
        }
        return selector;
    }

    /**
     * Class Entity.
     *
     * @author Adrian Gaudebert - adrian@gaudebert.fr
     * @constructor
     */
    var Entity = function(id) {
        var state = {};

        this.id = id;
        this.type = [];

        /**
         * Extend this entity by adding new states and methods.
         *
         * @param obj Component to take attributes and methods from.
         * @return this.
         */
        this.extend = function(obj) {
            var target = this,
                key;

            if (!obj)
                return target;

            for (key in obj) {
                // Avoid recursivity
                if (obj[key] === target)
                    continue;

                // Specific attributes and methods
                if (key === "_requires") {
                    target.requires(obj[key]);
                    continue;
                }

                // If not a function add the new property and
                // add a getter and a setter for it
                if (typeof obj[key] !== "function") {
                    target.set(key, obj[key]);
                    (function(object, property) {
                        // Getter
                        target.__defineGetter__(property, function() {
                            return object.get(property);
                        });
                        // Setter
                        target.__defineSetter__(property, function(value) {
                            object.set(property, value);
                        });
                    })(target, key);
                }
                // If a function add it directly to the object
                else {
                    target[key] = obj[key];
                }
            }

            return target;
        };

        /**
         * Add one or several components to the Entity.
         *
         * @param selector A list or a string of components to add to the Entity.
         * @return this.
         */
        this.requires = function(selector) {
            var c,
                comp;

            selector = prepareSelectors(selector);

            // selector is a list of components
            for (c in selector) {
                comp = components[selector[c]];
                if (this.type.indexOf(selector[c]) == -1 && comp) {
                    this.type.push(selector[c]);
                    this.extend(comp);
                }
            }

            return this;
        };

        /**
         * Get a value from the state of the Entity.
         */
        this.get = function(key) {
            return state[key];
        };

        /**
         * Set a value to a key in the state of the Entity.
         */
        this.set = function(key, value) {
            state[key] = value;
            return this;
        };
    };

    /**
     * Generate and return a unique ID.
     */
    this.UID = function() {
        return ++GUID;
    };

    /**
     * Add a Component to use in Entities.
     */
    this.addComponent = this.c = function(id, fn) {
        components[id] = fn;
        return this;
    };

    /**
     * Remove an existing Component.
     */
    this.removeComponent = function(id) {
        delete components[id];
        return this;
    };

    /**
     * Create and return a new Entity.
     *
     * @param selector A list or a string of components to add to the Entity.
     * @return Entity.
     */
    this.createEntity = this.e = function() {
        var id = this.UID(),
            ent;

        entities[id] = ent = new Entity(id);

        if (arguments.length > 0) {
            ent.requires.apply(ent, arguments);
        }
        ent.requires(["obj"]);

        return ent;
    };

    /**
     * Get all entities that contain at least all the specified components.
     *
     * @param selector A list or a string of components.
     * @return Array of Entity.
     */
    this.get = function(selector) {
        var i, j,
            e, c,
            valid,
            entitiesList = [];

        selector = prepareSelectors(selector);

        for (i in entities) {
            e = entities[i];
            valid = true;

            for (j in selector) {
                c = selector[j];
                if (e.type.indexOf(c) < 0) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                entitiesList.push(e);
            }
        }

        return entitiesList;
    }

    // Add a default component
    this.c("obj", {});
};

module.exports = EntityComponentManager;
