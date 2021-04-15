import { addComponent, defineComponent, removeComponent } from "bitecs";

export const Object3DComponent = defineComponent(new Map());

export function addObject3DComponent(world, eid, object3D) {
  Object3DComponent.set(eid, object3D);
  addComponent(world, Object3DComponent, eid);
}

export function removeObject3DComponent(world, eid) {
  Object3DComponent.delete(eid, object3D);
  removeComponent(world, Object3DComponent, eid);
}
