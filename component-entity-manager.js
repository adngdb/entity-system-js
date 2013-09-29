/**
 * ComponentEntityManager JavaScript Library v0.1
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
     * Class ComponentEntityManager
     *
     * Implement the Component / Entity model and provide tools to easily
     * create and manipulate Components and Entities.
     *
     * @constructor
     */
    function ComponentEntityManager() {
        var GUID = 0,
            entities = {},
            components = {},
            self = this;

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
            if (typeof selector !== 'object') {
                return null;
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
                        target.set(key, clone(obj[key]));
                        (function(object, property) {
                            // Getter
                            target.__defineGetter__(property, function() {
                                return object.get(property);
                            });
                            // Setter
                            target.__defineSetter__(property, function(value) {
                                object.set(property, value);
                                // If the CEM instance has an emit function,
                                // notify that an entity was changed.
                                if (self.emit instanceof Function) {
                                    self.emit('entityChanged', { 'entity': object });
                                }
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
                    if (!comp) {
                        throw 'Trying to use unknown component: "' + selector[c] + '"';
                    }
                    else if (this.type.indexOf(selector[c]) == -1) {
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
            var id;
            var ent;
            var args;

            if (arguments.length > 0) {
                if (typeof arguments[0] === 'number') {
                    // We force the ID of this new entity.
                    id = arguments[0];
                    args = Array.prototype.slice.call(arguments, 1);
                }
                else {
                    id = this.UID();
                    args = arguments;
                }
            }

            entities[id] = ent = new Entity(id);

            if (args.length > 0) {
                ent.requires.apply(ent, args);
            }
            ent.requires(["obj"]);

            return ent;
        };

        /**
         * Remove an Entity from the internal memory.
         *
         * @param entity The entity to remove.
         */
        this.removeEntity = this.r = function(entity) {
            delete entities[entity.id];
            return this;
        };

        /**
         * Return an entity from its ID or return all entities that contain at
         * least all the specified components.
         *
         * @param selector An ID, or a list or a string of components.
         * @return A single Entity object, an array of Entity objects, or
         *         null if no result was found.
         */
        this.get = function(selector) {
            var i, j,
                e, c,
                valid,
                entitiesList = [];

            // First verify if it's a valid id
            if (typeof selector == 'string' || typeof selector == 'number') {
                e = entities[selector];
                if (typeof e !== 'undefined' && e !== null) {
                    return e;
                }
            }

            // Otherwise consider it as a list of components
            selector = prepareSelectors(selector);

            if (selector === null || selector.length === 0) {
                return null;
            }

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

            if (entitiesList.length == 0) {
                return null;
            }

            return entitiesList;
        }

        /**
         * Return the list of all components available.
         *
         * @return An array of Component objects.
         */
        this.getComponentsList = function() {
            var list = [];
            for (c in components) {
                list.push(c);
            }
            return list;
        }

        // Add a default component
        this.c("obj", {});
    }

    return {
        'ComponentEntityManager': ComponentEntityManager
    };

});
