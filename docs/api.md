

<!-- Start src/entity-manager.js -->

## EntityManager 
Implement the Entity System model and provide tools to easily
create and manipulate Entities, Components and Processors.

## getUid()

Return an identifier unique to this system.

### Return:

* **int** - Unique identifier.

## createEntity(componentIds, entityId, initialState)

Create a new entity in the system by creating a new instance of each of its components.

### Params:

* **array** *componentIds* - List of identifiers of the components that compose the new entity.
* **int** *entityId* - Optional. Unique identifier of the entity. If passed, no new id will be generated.
* **object** *initialState* - Optional. Object containing the initial state to apply.

### Return:

* **int** - Unique identifier of the new entity.

## removeEntity(id)

Remove an entity and its instanciated components from the system.

### Params:

* **int** *id* - Unique identifier of the entity.

### Return:

* **object** - this

## addComponent(id, component)

Add a component to the list of known components.

### Params:

* **string** *id* - Unique identifier of the component.
* **object** *component* - Object containing the metadata and data of the component.

### Return:

* **object** - this

## addComponents(components)

Add a list of components to known components.

### Params:

* **Array** *components* - Array of objects containing the metadata and data of components. Requires that each object has `name` used to identify
it, and `data` to describe it.

### Return:

* **object** - this

## removeComponent(id)

Remove a component from the list of known components.

### Params:

* **string** *id* - Unique identifier of the component.

### Return:

* **object** - this

## getComponentsList()

Get the list of components this instance knows.

### Return:

* **array** - List of names of components.

## addComponentsToEntity(componentIds, entityId, initialState)

Create a new instance of each listed component and associate them with the entity.

### Params:

* **array** *componentIds* - List of identifiers of the components to add to the entity.
* **int** *entityId* - Unique identifier of the entity.
* **object** *initialState* - Optional. Object containing the initial state to apply.

### Return:

* **object** - this

## removeComponentsFromEntity(componentIds, entityId)

De-associate a list of components from the entity.

### Params:

* **array** *componentIds* - List of identifiers of the components to remove from the entity.
* **int** *entityId* - Unique identifier of the entity.

### Return:

* **object** - this

## getComponentDataForEntity(entityId, componentId)

Return a reference to an object that contains the data of an
instanciated component of an entity.

### Params:

* **int** *entityId* - Unique identifier of the entity.
* **string** *componentId* - Unique identifier of the component.

### Return:

* **object** - Component data of one entity.

## updateComponentDataForEntity(entityId, componentId, newState, sendUpdateEvent)

Update the state of a component, many keys at once.

### Params:

* **int** *entityId* - Unique identifier of the entity.
* **string** *componentId* - Unique identifier of the component.
* **object** *newState* - Object containing the new state to apply.
* **boolean** *sendUpdateEvent* - Optional. True if the method has to send the `COMPONENT_UPDATED` event.

### Return:

* **object** - this

## getComponentsData(componentId)

Return a dictionary of objects containing the data of all instances of a
given component.

### Params:

* **string** *componentId* - Unique identifier of the component.

### Return:

* **Object** - Dictionary of entity id -> component data.

## entityHasComponent(entityId, componentId)

Return true if the entity has the component.

### Params:

* **int** *entityId* - Unique identifier of the entity.
* **string** *componentId* - Unique identifier of the component.

### Return:

* **boolean** - True if the entity has the component.

## addAssemblage(id, assemblage)

Add an assemblage to the list of known assemblages.

### Params:

* **string** *id* - Unique identifier of the assemblage.
* **object** *assemblage* - An instance of an assemblage to add.

### Return:

* **object** - this

## addAssemblages(assemblages)

Add a list of assemblages to known assemblages.

### Params:

* **Array** *assemblages* - An array of assemblages to add. Require that each object has a `name` property to use as identifier.

### Return:

* **object** - this

## removeAssemblage(id)

Remove an assemblage from the list of known assemblages.

### Params:

* **string** *id* - Unique identifier of the assemblage.

### Return:

* **object** - this

## createEntityFromAssemblage(assemblageId)

Create a new entity in the system by creating a new instance of each of
its components and setting their initial state, using an assemblage.

### Params:

* **string** *assemblageId* - Id of the assemblage to create the entity from.

### Return:

* **int** - Unique identifier of the new entity.

## addProcessor(processor)

Add a processor to the list of known processors.

### Params:

* **object** *processor* - An instance of a processor to manage.

### Return:

* **object** - this

## addProcessors(processors)

Add a list of processors to known processors.

### Params:

* **Array** *processors* - An array of processors to manage.

### Return:

* **object** - this

## removeProcessor(processor)

Remove a processor from the list of known processors.

### Params:

* **object** *processor* - An instance of a processor to remove.

### Return:

* **object** - this

## sendEventToProcessors(eventName, entityId, componentId)

Send an event to the list of known processors.

### Params:

* **string** *eventName* - Id of the event to send.
* **number** *entityId* - Unique identifier of the entity on which the event occured.
* **string** *componentId* - Unique identifier of the component on which the event occured.

### Return:

* **object** - this

## update(dt)

Update all the known processors.

### Params:

* **int** *dt* - The time delta since the last call to update. Will be passed as an argument to all processor's `update` method.

### Return:

* **object** - this

<!-- End src/entity-manager.js -->

