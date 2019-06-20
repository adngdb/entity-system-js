# Master

## Current

- Revert `getComponentsData` to return an object (entity => component). **[BREAKING]**

## 1.4.0 (August 1, 2018)

- Made `getComponentsData` return an actual array (as documented) instead of an object. **[BREAKING]**

## 1.3.0 (May 22, 2017)

- Fixed a race condition when signaling that a component has been added to an entity.
- Rewrote some loops to use `forEach`, and switched `var` to `let` or `const`.
- Fixed a scope issue when adding multiple components at once.
- Made component properties enumerable (when the EntityManager is instantiated with a listener).
- Emit more events: 'entityCreated', 'entityComponentAdded' and 'entityComponentRemoved'.
- createEntity now accepts an ID, to make synchronization of distant systems possible.
- Upgraded libraries rollup and amdefine to their latest versions.
- Use rollup to compile code ([#7](https://github.com/adngdb/entity-system-js/issues/7)).

## 1.2.0 (Jun 26, 2016)

- Emit an event: 'entityComponentUpdated'.
- Allow a listener to be passed to the constructor of EntityManager.

## 1.1.1 (Apr 10, 2016)

- Fixed version number (hence the version bump).

## 1.1.0 (Apr 10, 2016)

- Do not add getters and setters when there's no emit method ([#16](https://github.com/adngdb/entity-system-js/issues/16)).
- Added a benchmark script ([#20](https://github.com/adngdb/entity-system-js/pull/20)).

## 1.0.0 (Jul 3, 2015)

- Initial public release.
