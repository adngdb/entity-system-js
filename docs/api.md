

<!-- Start entity-manager.js -->

## EntityManager 
Implement the Entity System model and provide tools to easily
create and manipulate Components and Entities.

## addComponent(id, component)

Add a component to the list of known components.

### Params:

* **string** *id* - Unique identifier of the component.
* **object** *component* - Object containing the metadata and data of the component.

### Return:

* **object** - this

## removeComponent(id)

Remove a component from the list of known components.

### Params:

* **string** *id* - Unique identifier of the component.

### Return:

* **object** - this

## createEntity(componentIds)

Create a new entity in the system by creating a new instance of each of
its components.

### Params:

* **array** *componentIds* - List of identifiers of the components that compose the new entity.

### Return:

* **int** - Unique identifier of the new entity.

## addComponentsToEntity(componentIds)

Create a new entity in the system by creating a new instance of each of
its components.

### Params:

* **array** *componentIds* - List of identifiers of the components that compose the new entity.

### Return:

* **object** - this

## getEntityWithComponent(entityId, componentId)

Return a reference to an object that contains the data of an
instanciated component of an entity.

### Params:

* **int** *entityId* - Unique identifier of the entity.
* **string** *componentId* - Unique identifier of the component.

### Return:

* **object** - Component data of one entity.

## getEntitiesWithComponent(componentId)

Return a list of objects containing the data of all of a given component.

### Params:

* **string** *componentId* - Unique identifier of the component.

### Return:

* **array** - List of component data for one component.

## removeEntity(id)

Remove an entity and its instanciated components from the system.

### Params:

* **int** *id* - Unique identifier of the entity.

### Return:

* **object** - this

## getComponentsList()

Get the list of components this instance knows.

### Return:

* **array** - List of names of components.

## getUid()

Return an identifier unique to this system.

### Return:

* **int** - Unique identifier.

<!-- End entity-manager.js -->

<!-- Start processor-manager.js -->

## ProcessorManager 
Implement the Entity System model and provide tools to easily
manipulate Processors for you Entities.

## addProcessor(processor)

Add a processor to the list of known processors.

### Params:

* **object** *processor* - An instance of a processor to manage.

### Return:

* **object** - this

## update(dt)

Update all the known processors.

### Params:

* **int** *dt* - The time delta, in miliseconds, since the last call to update.

### Return:

* **object** - this

<!-- End processor-manager.js -->

