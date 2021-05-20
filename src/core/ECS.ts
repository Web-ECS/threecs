import {
  IComponent as _Component,
  IComponentProp as _ComponentProp,
  IWorld,
  TypedArray as _TypedArray,
  Type as _Type,
  Types as _Types,
  defineComponent as _defineComponent,
  defineQuery as _defineQuery,
  addEntity as _addEntity,
  removeEntity as _removeEntity,
  addComponent as _addComponent,
  removeComponent as _removeComponent,
  hasComponent as _hasComponent,
  Changed as _Changed,
  Not as _Not,
  enterQuery as _enterQuery,
  exitQuery as _exitQuery,
  commitRemovals as _commitRemovals,
  defineSystem as _defineSystem,
} from "bitecs";
import { Object3D } from "three";
import { Object3DComponent } from "../components";
import { ActionMap, ActionState } from "../systems/ActionMappingSystem";

export { pipe } from "bitecs";

export interface World extends IWorld {
  dt: number;
  time: number;
  input: Map<string, number>;
  actionMaps: ActionMap[];
  actions: Map<string, ActionState>;
  objectEntityMap: Map<Object3D, number>;
}

export type Query = (world: World) => number[];

export type System = (world: World) => void;

export type Type = _Type;

export const Types = _Types;

export type TypedArray = _TypedArray;

export type ComponentProp = _ComponentProp;

export type Schema = {
  [key: string]: Type | Schema;
};

export interface Component {
  [key: string]: TypedArray | ComponentProp;
}

export type QueryModifier = (
  c: (Component | ComponentProp)[]
) => (world: World) => Component | ComponentProp;

export const defineQuery = _defineQuery as (
  components: (Component | QueryModifier)[]
) => Query;

export const addEntity = _addEntity as unknown as (world: World) => number;

export const removeEntity = _removeEntity as unknown as (
  world: World,
  eid: number
) => void;

export const defineComponent = _defineComponent as unknown as (
  schema: Schema
) => Component;

export const addComponent = _addComponent as unknown as (
  world: World,
  component: Component,
  eid: number
) => void;

export const removeComponent = _removeComponent as unknown as (
  world: World,
  component: Component,
  eid: number
) => void;

export const hasComponent = _hasComponent as unknown as (
  world: World,
  component: Component,
  eid: number
) => boolean;

export const Changed = _Changed as unknown as (
  c: (Component | ComponentProp)[]
) => (world: World) => Component | ComponentProp;

export const Not = _Not as unknown as (
  c: (Component | ComponentProp)[]
) => (world: World) => Component | ComponentProp;

export const enterQuery = _enterQuery as unknown as (query: Query) => Query;

export const exitQuery = _exitQuery as unknown as (query: Query) => Query;

export const commitRemovals = _commitRemovals as unknown as (
  world: World
) => void;

export const defineSystem = _defineSystem as unknown as (
  update: (world: World) => void
) => System;

export type MapComponent<V> = Component & { storage: Map<number, V> };

export function defineMapComponent<V>(): MapComponent<V> {
  const component = defineComponent({});
  (component as any).storage = new Map();
  return component as MapComponent<V>;
}

export function addMapComponent<V>(
  world: World,
  component: MapComponent<V>,
  eid: number,
  value: V
) {
  addComponent(world, component, eid);
  component.storage.set(eid, value);
}

export function removeMapComponent(
  world: World,
  component: MapComponent<any>,
  eid: number
) {
  removeComponent(world, component, eid);
  component.storage.delete(eid);
}

export function addObject3DComponent(
  world: World,
  eid: number,
  obj: Object3D,
  parent?: Object3D
) {
  if (parent) {
    parent.add(obj);
  }

  addMapComponent(world, Object3DComponent, eid, obj);
  world.objectEntityMap.set(obj, eid);
}

export function addObject3DEntity(
  world: World,
  obj: Object3D,
  parent?: Object3D
) {
  const eid = addEntity(world);
  addObject3DComponent(world, eid, obj, parent);
  return eid;
}

export function removeObject3DComponent(world: World, eid: number) {
  const obj = Object3DComponent.storage.get(eid);

  if (!obj) {
    return;
  }

  if (obj.parent) {
    obj.parent.remove(obj);
  }

  removeMapComponent(world, Object3DComponent, eid);
  world.objectEntityMap.delete(obj);

  obj.traverse((child) => {
    if (child === obj) {
      return;
    }

    const childEid = getObject3DEntity(world, child);

    if (childEid) {
      removeEntity(world, childEid);
      Object3DComponent.storage.delete(childEid);
      world.objectEntityMap.delete(child);
    }
  });
}

export function removeObject3DEntity(world: World, eid: number) {
  removeObject3DComponent(world, eid);
  removeEntity(world, eid);
}

export function getObject3DEntity(
  world: World,
  obj: Object3D
): number | undefined {
  return world.objectEntityMap.get(obj);
}

export function setEntityObject3D(world: World, eid: number, obj: Object3D) {
  addMapComponent(world, Object3DComponent, eid, obj);
  world.objectEntityMap.set(obj, eid);
}

export function singletonQuery(
  query: Query
): (world: World) => number | undefined {
  return (world: World) => {
    const entities = query(world);
    return entities.length > 0 ? entities[0] : undefined;
  };
}
