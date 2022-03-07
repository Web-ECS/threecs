import { MeshProxy, Object3DEntity, Object3DProxy, Object3DSoAoA, PerspectiveCameraProxy, SceneProxy, setQuaternionFromEulerAoA, traverse } from "@webecs/do-three";
import {
  IComponent,
  IComponentProp,
  IWorld,
  TypedArray,
  Type,
  Types,
  defineComponent,
  defineQuery,
  addEntity,
  removeEntity,
  addComponent,
  removeComponent,
  hasComponent,
  Changed,
  Not,
  enterQuery,
  exitQuery,
  commitRemovals,
  defineSystem,
  ISchema,
  Query,
} from "bitecs";
import { BufferGeometry, Material, Scene, Camera, PerspectiveCamera } from "three";
import { CameraComponent, Object3DComponent, SceneComponent, VisibleComponent } from "./components";
import { ActionMap, ActionState } from "../systems/ActionMappingSystem";
import { World } from './World'
import { maxEntities } from "./config";
import { MeshEntity, ObjectEntity } from "./entities";


export * from 'bitecs'


/* TYPES */


// export type Query = (world: World) => number[];

// export type System = (world: World) => void;

// export type Type = _Type;

// export const Types = _Types;

// export type TypedArray = _TypedArray;

// export type ComponentProp = _ComponentProp;

// export type Schema = {
//   [key: string]: Type | [string, number] | Schema;
// };

// export interface Component {
//   [key: string]: TypedArray | ComponentProp;
// }

// export type QueryModifier = (
//   c: (Component | ComponentProp)[]
// ) => (world: World) => Component | ComponentProp;



/* bitECS API */


// export const defineQuery = _defineQuery as (
//   components: (Component | QueryModifier)[]
// ) => Query;

// export const addEntity = _addEntity as unknown as (world: World) => number;

// export const removeEntity = _removeEntity as unknown as (
//   world: World,
//   eid: number
// ) => void;

// export const defineComponent = _defineComponent as unknown as (
//   schema: Schema
// ) => Component;

// export const addComponent = _addComponent as unknown as (
//   world: World,
//   component: Component,
//   eid: number,
//   reset?: boolean
// ) => void;

// export const removeComponent = _removeComponent as unknown as (
//   world: World,
//   component: Component,
//   eid: number,
//   reset?: boolean
// ) => void;

// export const hasComponent = _hasComponent as unknown as (
//   world: World,
//   component: Component,
//   eid: number
// ) => boolean;

// export const Changed = _Changed as unknown as (
//   c: (Component | ComponentProp)[]
// ) => (world: World) => Component | ComponentProp;

// export const Not = _Not as unknown as (
//   c: (Component | ComponentProp)[]
// ) => (world: World) => Component | ComponentProp;

// export const enterQuery = _enterQuery as unknown as (query: Query) => Query;

// export const exitQuery = _exitQuery as unknown as (query: Query) => Query;

// export const commitRemovals = _commitRemovals as unknown as (
//   world: World
// ) => void;

// export const defineSystem = _defineSystem as unknown as (
//   update: (world: World) => void
// ) => System;




/* threecs API */

export type MapComponent<V> = IComponent & { store: Map<number, V> };

export function defineMapComponent<V>(): MapComponent<V> {
  const component = defineComponent() as MapComponent<V>;
  component.store = new Map();
  return component;
}

export function addMapComponent<V>(
  world: World,
  component: MapComponent<V>,
  eid: number,
  value: V
) {
  addComponent(world, component, eid, false);
  const obj = component.store.get(eid)
  // save GC by not deleting?
  if (obj) Object.assign(obj, value);
  else component.store.set(eid, value);
}

export function removeMapComponent(
  world: World,
  component: MapComponent<any>,
  eid: number
) {
  removeComponent(world, component, eid);
  // save GC by not deleting?
  // component.store.delete(eid);
}

export function defineProxyComponent<SoA, Proxy>(schema: ISchema): SoA & MapComponent<Proxy> {
  const component = defineComponent(schema, maxEntities) as SoA & MapComponent<Proxy>;
  component.store = new Map<number, Proxy>();
  return component;
}


// export type ObjectComponent<V> = { store: Array<V> };

// export function defineObjectComponent<V>(): V & ObjectComponent<V> {
//   const component = defineComponent() as V & ObjectComponent<V>;
//   component.store = new Array<V>(maxEntities);
//   return component;
// }

// export function addObjectComponent<V>(
//   world: World,
//   component: ObjectComponent<V>,
//   eid: number,
//   value: V
// ) {
//   addComponent(world, component, eid, false);
//   // reuse old object to prevent garbage
//   if (component.store[eid] !== undefined) {
//     Object.assign(component.store[eid], value)
//   } else {
//     component.store[eid] = value;
//   }
// }

// export function removeObjectComponent(
//   world: World,
//   component: ObjectComponent<any>,
//   eid: number
// ) {
//   removeComponent(world, component, eid);
// }

export const setParentEntity = (child: number, parent: number) => {
  const p = Object3DComponent.store.get(parent)!
  const c = Object3DComponent.store.get(child)!
  p.add(c)
}

export const setChildEntity = (parent: number, child: number) => {
  const p = Object3DComponent.store.get(parent)!
  const c = Object3DComponent.store.get(child)!
  p.add(c)
}

export function addObject3DComponent(
  world: World,
  eid: number,
  obj: Object3DEntity,
  parent?: number
) {
  if (parent !== undefined) {
    const p = Object3DComponent.store.get(parent)!
    p.add(obj);
  }
  addMapComponent(world, Object3DComponent, eid, obj);
}

export function addObject3DEntity(
  world: World,
  parent?: number
) {
  const eid = addEntity(world);
  const obj = new ObjectEntity(world, Object3DComponent, eid)
  addObject3DComponent(world, eid, obj, parent);
  addComponent(world, VisibleComponent, eid);
  return eid;
}

export function addMeshEntity(
  world: World,
  geometry: BufferGeometry,
  material: Material,
  parent?: number,
) {
  const eid = addEntity(world);
  const obj = new MeshEntity(world, Object3DComponent, eid, geometry, material);
  addObject3DComponent(world, eid, obj, parent);
  addComponent(world, VisibleComponent, eid);
  return eid;
}

export function addPerspectiveCameraEntity(
  world: World,
  parent?: number,
) {
  const eid = addEntity(world);
  const obj = new PerspectiveCameraProxy(Object3DComponent, eid);
  addObject3DComponent(world, eid, obj, parent);
  addComponent(world, CameraComponent, eid);
  return eid;
}

export function addSceneEntity(
  world: World,
  parent?: number,
) {
  const eid = addEntity(world);
  const obj = new SceneProxy(Object3DComponent, eid);
  addObject3DComponent(world, eid, obj, parent);
  addComponent(world, SceneComponent, eid);
  return eid;
}

export function removeObject3DComponent(world: World, eid: number) {
  const obj = Object3DComponent.store.get(eid)

  if (!obj) {
    return;
  }

  if (obj.parent) {
    obj.parent.remove(obj);
  }

  removeMapComponent(world, Object3DComponent, eid);

  traverse(Object3DComponent, eid, (childEid: number) => {
    removeEntity(world, childEid);
    // save GC by not deleting?
    // Object3DComponent.store.delete(childEid);
  });

  // obj.traverse((child: Object3DEntity) => {
  //   if (child === obj) {
  //     return;
  //   }

  //   // const childEid = getObject3DEntity(world, child);
  //   const childEid = child.eid

  //   if (childEid) {
  //     removeEntity(world, childEid);
  //     Object3DComponent.storage.delete(childEid);
  //     world.objectEntityMap.delete(child);
  //   }
  // });
}

export function removeObject3DEntity(world: World, eid: number) {
  removeObject3DComponent(world, eid);
  removeEntity(world, eid);
}

// export function getObject3DEntity(
//   world: World,
//   obj: Object3DEntity
// ): number | undefined {
//   // return world.objectEntityMap.get(obj);
//   return obj.eid
// }

// export function setEntityObject3D(world: World, eid: number, obj: Object3DEntity) {
//   addMapComponent(world, Object3DComponent, eid, obj);
//   world.objectEntityMap.set(obj, eid);
// }

// export function singletonQuery(
//   query: Query
// ): (world: World) => number | undefined {
//   return (world: World) => {
//     const entities = query(world);
//     return entities.length > 0 ? entities[0] : undefined;
//   };
// }

export function singletonQuery(
  query: Query
): (world: World) => number | undefined {
  return (world: World) => {
    const entities = query(world);
    return entities.length > 0 ? entities[0] : undefined;
  };
}
