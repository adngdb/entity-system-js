!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(t=t||self).ensy=n()}(this,(function(){"use strict";function t(n){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(n)}function n(t,n){for(var e=0;e<n.length;e++){var o=n[e];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}
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
function e(n){if(null==n||"object"!=t(n))return n;var o;if(n instanceof Date)return(o=new Date).setTime(n.getTime()),o;if(n instanceof Array){o=[];for(var i=0,r=n.length;i<r;i++)o[i]=e(n[i]);return o}if(n instanceof Object){for(var s in o={},n)n.hasOwnProperty(s)&&(o[s]=e(n[s]));return o}}
/*!
   * Return true if the parameter is a function.
   * From https://stackoverflow.com/questions/5999998
   */return function(){function t(n){var e;!function(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}(this,t),this.listener=null,n&&((e=n.emit)&&"[object Function]"==={}.toString.call(e))&&(this.listener=n),this.entities=[],this.components={},this.assemblages={},
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
this.entityComponentData={},this.processors=[],this.uid=0}var o,i,r;return o=t,(i=[{key:"getUid",value:function(){return this.uid++}},{key:"createEntity",value:function(t,n){return null==n?n=this.getUid():n>this.uid&&(this.uid=n),this.addComponentsToEntity(t,n),this.entities.includes(n)||this.entities.push(n),this.listener&&this.listener.emit("entityCreated",n),n}},{key:"removeEntity",value:function(t){for(var n in this.entityComponentData)this.entityComponentData.hasOwnProperty(n)&&this.entityComponentData[n][t]&&delete this.entityComponentData[n][t];return this.entities.splice(this.entities.indexOf(t),1),this.listener&&this.listener.emit("entityRemoved",t),this}},{key:"addComponent",value:function(t,n){return this.components[t]=n,this}},{key:"addComponents",value:function(t){var n=this;return t.forEach((function(t){return n.addComponent(t.name,t)})),this}},{key:"removeComponent",value:function(t){return delete this.components[t],delete this.entityComponentData[t],this}},{key:"getComponentsList",value:function(){return Object.keys(this.components)}},{key:"addComponentsToEntity",value:function(t,n){var o=this,i=this;return t.forEach((function(t){if(!o.components[t])throw new Error("Trying to use unknown component: "+t)})),t.forEach((function(t){o.entityComponentData[t]||(o.entityComponentData[t]={});var r=null;o.listener?function(t,o){var r=e(i.components[o].state);for(var s in r)r.hasOwnProperty(s)&&function(e){Object.defineProperty(t,e,{enumerable:!0,get:function(){return r[e]},set:function(t){r[e]=t,i.listener.emit("entityComponentUpdated",n,o)}})}(s)}(r={},t):r=e(i.components[t].state),r.__id=n,o.entityComponentData[t][n]=r,o.listener&&o.listener.emit("entityComponentAdded",n,t)})),t.forEach((function(t){o.sendEventToProcessors("COMPONENT_CREATED",n,t)})),this}},{key:"removeComponentsFromEntity",value:function(t,n){var e=this;return t.forEach((function(t){if(!e.components[t])throw new Error("Trying to use unknown component: "+t)})),t.forEach((function(t){e.entityComponentData[t]&&e.entityComponentData[t][n]&&(delete e.entityComponentData[t][n],e.listener&&e.listener.emit("entityComponentRemoved",n,t))})),this}},{key:"getComponentDataForEntity",value:function(t,n){if(!(t in this.components))throw new Error("Trying to use unknown component: "+t);if(!this.entityComponentData.hasOwnProperty(t)||!this.entityComponentData[t].hasOwnProperty(n))throw new Error("No data for component "+t+" and entity "+n);return this.entityComponentData[t][n]}},{key:"updateComponentDataForEntity",value:function(t,n,e){var o=this.getComponentDataForEntity(t,n);for(var i in e)e.hasOwnProperty(i)&&o.hasOwnProperty(i)&&(o[i]=e[i]);return this.sendEventToProcessors("COMPONENT_UPDATED",n,t),this}},{key:"getComponentsData",value:function(t){if(!(t in this.components))throw new Error("Trying to use unknown component: "+t);return this.entityComponentData.hasOwnProperty(t)?this.entityComponentData[t]:{}}},{key:"entityHasComponent",value:function(t,n){return n in this.components&&this.entityComponentData.hasOwnProperty(n)&&this.entityComponentData[n].hasOwnProperty(t)}},{key:"addAssemblage",value:function(t,n){return this.assemblages[t]=n,this}},{key:"addAssemblages",value:function(t){var n=this;return t.forEach((function(t){return n.assemblages[t.name]=t})),this}},{key:"removeAssemblage",value:function(t){return delete this.assemblages[t],this}},{key:"createEntityFromAssemblage",value:function(t){if(!(t in this.assemblages))throw new Error("Trying to use unknown assemblage: "+t);var n=this.assemblages[t],e=this.createEntity(n.components);for(var o in n.initialState)if(n.initialState.hasOwnProperty(o)){var i=n.initialState[o];this.updateComponentDataForEntity(o,e,i)}return e}},{key:"addProcessor",value:function(t){return this.processors.push(t),this}},{key:"addProcessors",value:function(t){var n=this;return t.forEach((function(t){return n.processors.push(t)})),this}},{key:"removeProcessor",value:function(t){return this.processors.splice(this.processors.indexOf(t),1),this}},{key:"sendEventToProcessors",value:function(t,n,e){var o=this;this.processors.forEach((function(i){"on"in i&&"function"==typeof i.on&&i.on(t,{entity:n,component:e,state:o.entityComponentData[e][n]})}))}},{key:"update",value:function(t){return this.processors.forEach((function(n){return n.update(t)})),this}}])&&n(o.prototype,i),r&&n(o,r),t}()}));
//# sourceMappingURL=entity-manager.js.map
