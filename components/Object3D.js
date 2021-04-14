import { addComponent, defineComponent, removeComponent } from "bitecs";

export const Object3DMap = new Map();

export const Object3DComponent = defineComponent({});

export function addObject3DComponent(world, eid, object3D) {
  Object3DMap.set(eid, object3D);
  addComponent(world, Object3DComponent, eid);
}

export function removeObject3DComponent(world, eid) {
  Object3DMap.delete(eid, object3D);
  removeComponent(world, Object3DComponent, eid);
}
