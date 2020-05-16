!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).ensy=e()}(this,(function(){"use strict";function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(e)}function e(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}
/*!
   * ensy - Entity System JavaScript Library v1.5.0
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
function n(e){if(null==e||"object"!=t(e))return e;var o;if(e instanceof Date)return(o=new Date).setTime(e.getTime()),o;if(e instanceof Array){o=[];for(var i=0,r=e.length;i<r;i++)o[i]=n(e[i]);return o}if(e instanceof Object){for(var s in o={},e)e.hasOwnProperty(s)&&(o[s]=n(e[s]));return o}}
/*!
   * Return true if the parameter is a function.
   * From https://stackoverflow.com/questions/5999998
   */return function(){function t(e){var n;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.listener=null,e&&((n=e.emit)&&"[object Function]"==={}.toString.call(n))&&(this.listener=e),this.entities=[],this.components={},this.assemblages={},
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
this.entityComponentData={},this.processors=[],this.uid=0}var o,i,r;return o=t,(i=[{key:"getUid",value:function(){return this.uid++}},{key:"createEntity",value:function(t,e){return null==e?e=this.getUid():e>this.uid&&(this.uid=e),this.addComponentsToEntity(t,e),this.entities.includes(e)||this.entities.push(e),this.listener&&this.listener.emit("entityCreated",e),e}},{key:"removeEntity",value:function(t){for(var e in this.entityComponentData)this.entityComponentData.hasOwnProperty(e)&&this.entityComponentData[e][t]&&delete this.entityComponentData[e][t];return this.entities.splice(this.entities.indexOf(t),1),this.listener&&this.listener.emit("entityRemoved",t),this}},{key:"addComponent",value:function(t,e){return this.components[t]=e,this}},{key:"addComponents",value:function(t){var e=this;return t.forEach((function(t){return e.addComponent(t.name,t)})),this}},{key:"removeComponent",value:function(t){return delete this.components[t],delete this.entityComponentData[t],this}},{key:"getComponentsList",value:function(){return Object.keys(this.components)}},{key:"addComponentsToEntity",value:function(t,e){var o=this,i=this;return t.forEach((function(t){if(!o.components[t])throw new Error("Trying to use unknown component: "+t)})),t.forEach((function(t){o.entityComponentData[t]||(o.entityComponentData[t]={});var r=null;o.listener?function(t,o){var r=n(i.components[o].state);for(var s in r)r.hasOwnProperty(s)&&function(n){Object.defineProperty(t,n,{enumerable:!0,get:function(){return r[n]},set:function(t){r[n]=t,i.listener.emit("entityComponentUpdated",e,o)}})}(s)}(r={},t):r=n(i.components[t].state),r.__id=e,o.entityComponentData[t][e]=r,o.listener&&o.listener.emit("entityComponentAdded",e,t)})),this}},{key:"removeComponentsFromEntity",value:function(t,e){var n=this;return t.forEach((function(t){if(!n.components[t])throw new Error("Trying to use unknown component: "+t)})),t.forEach((function(t){n.entityComponentData[t]&&n.entityComponentData[t][e]&&(delete n.entityComponentData[t][e],n.listener&&n.listener.emit("entityComponentRemoved",e,t))})),this}},{key:"getComponentDataForEntity",value:function(t,e){if(!(t in this.components))throw new Error("Trying to use unknown component: "+t);if(!this.entityComponentData.hasOwnProperty(t)||!this.entityComponentData[t].hasOwnProperty(e))throw new Error("No data for component "+t+" and entity "+e);return this.entityComponentData[t][e]}},{key:"updateComponentDataForEntity",value:function(t,e,n){var o=this.getComponentDataForEntity(t,e);for(var i in n)n.hasOwnProperty(i)&&o.hasOwnProperty(i)&&(o[i]=n[i]);return this}},{key:"getComponentsData",value:function(t){if(!(t in this.components))throw new Error("Trying to use unknown component: "+t);return this.entityComponentData.hasOwnProperty(t)?this.entityComponentData[t]:{}}},{key:"entityHasComponent",value:function(t,e){return e in this.components&&this.entityComponentData.hasOwnProperty(e)&&this.entityComponentData[e].hasOwnProperty(t)}},{key:"addAssemblage",value:function(t,e){return this.assemblages[t]=e,this}},{key:"addAssemblages",value:function(t){var e=this;return t.forEach((function(t){return e.assemblages[t.name]=t})),this}},{key:"removeAssemblage",value:function(t){return delete this.assemblages[t],this}},{key:"createEntityFromAssemblage",value:function(t){if(!(t in this.assemblages))throw new Error("Trying to use unknown assemblage: "+t);var e=this.assemblages[t],n=this.createEntity(e.components);for(var o in e.initialState)if(e.initialState.hasOwnProperty(o)){var i=e.initialState[o];this.updateComponentDataForEntity(o,n,i)}return n}},{key:"addProcessor",value:function(t){return this.processors.push(t),this}},{key:"addProcessors",value:function(t){var e=this;return t.forEach((function(t){return e.processors.push(t)})),this}},{key:"removeProcessor",value:function(t){return this.processors.splice(this.processors.indexOf(t),1),this}},{key:"update",value:function(t){return this.processors.forEach((function(e){return e.update(t)})),this}}])&&e(o.prototype,i),r&&e(o,r),t}()}));
//# sourceMappingURL=entity-manager.js.map
