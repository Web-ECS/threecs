import { addEntity, removeEntity, IWorld } from "bitecs";
import { Object3D } from "three";
import { addMapComponent, removeMapComponent } from "./MapComponent";
import { Object3DComponent } from "../components";

const $object3DEntityMap = Symbol("object3DEntityMap");

export function initObject3DStorage(world: IWorld) {
  (world as any)[$object3DEntityMap] = new Map();
}

export function addObject3DComponent(
  world: IWorld,
  eid: number,
  obj: Object3D,
  parent?: Object3D
) {
  if (parent) {
    parent.add(obj);
  }

  addMapComponent(world, Object3DComponent, eid, obj);
  (world as any)[$object3DEntityMap].set(obj, eid);
}

export function addObject3DEntity(
  world: IWorld,
  obj: Object3D,
  parent?: Object3D
) {
  const eid = addEntity(world);
  addObject3DComponent(world, eid, obj, parent);
  return eid;
}

export function removeObject3DComponent(world: IWorld, eid: number) {
  const obj = Object3DComponent.storage.get(eid);

  if (!obj) {
    return;
  }

  if (obj.parent) {
    obj.parent.remove(obj);
  }

  removeMapComponent(world, Object3DComponent, eid);
  (world as any)[$object3DEntityMap].delete(obj);

  obj.traverse((child) => {
    if (child === obj) {
      return;
    }

    const childEid = getObject3DEntity(world, child);

    if (childEid) {
      removeEntity(world, childEid);
      Object3DComponent.storage.delete(childEid);
      (world as any)[$object3DEntityMap].delete(child);
    }
  });
}

export function removeObject3DEntity(world: IWorld, eid: number) {
  removeObject3DComponent(world, eid);
  removeEntity(world, eid);
}

export function getObject3DEntity(world: IWorld, obj: Object3D): number {
  return (world as any)[$object3DEntityMap].get(obj);
}

export function setEntityObject3D(world: IWorld, eid: number, obj: Object3D) {
  addMapComponent(world, Object3DComponent, eid, obj);
  (world as any)[$object3DEntityMap].set(obj, eid);
}
