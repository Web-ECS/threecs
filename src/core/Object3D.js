import { addEntity, removeEntity } from "bitecs";
import { addMapComponent, removeMapComponent } from "./MapComponent";
import { Object3DComponent } from "../components";

const $object3DEntityMap = Symbol("object3DEntityMap");

export function initObject3DStorage(world) {
  world[$object3DEntityMap] = new Map();
}

export function addObject3DComponent(world, eid, obj, parent) {
  if (parent) {
    parent.add(obj);
  }

  addMapComponent(world, Object3DComponent, eid, obj);
  world[$object3DEntityMap].set(obj, eid);
}

export function addObject3DEntity(world, obj, parent) {
  const eid = addEntity(world);
  addObject3DComponent(world, eid, obj, parent);
  return eid;
}

export function removeObject3DComponent(world, eid) {
  const obj = Object3DComponent.storage.get(eid);

  if (!obj) {
    return;
  }

  if (obj.parent) {
    obj.parent.remove(obj);
  }

  removeMapComponent(world, Object3DComponent, eid);
  world[$object3DEntityMap].delete(obj);

  obj.traverse((child) => {
    if (child === obj) {
      return;
    }

    const childEid = getObject3DEntity(world, child);

    if (childEid) {
      removeEntity(world, childEid);
      Object3DComponent.storage.delete(childEid);
      world[$object3DEntityMap].delete(child);
    }
  });
}

export function removeObject3DEntity(world, eid) {
  removeObject3DComponent(world, eid);
  removeEntity(world, eid);
}

export function getObject3DEntity(world, obj) {
  return world[$object3DEntityMap].get(obj);
}

export function setEntityObject3D(world, eid, obj) {
  addMapComponent(world, Object3DComponent, eid, obj);
  world[$object3DEntityMap].set(obj, eid);
}
