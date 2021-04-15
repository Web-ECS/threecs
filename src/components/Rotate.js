import { defineComponent, addComponent, removeComponent } from "bitecs";

export const RotateComponent = defineComponent(new Map());

export function addRotateComponent(world, eid, axis, speed) {
  addComponent(world, RotateComponent, eid);
  RotateComponent.set(eid, { axis, speed });
}

export function removeRotateComponent(world, eid) {
  removeComponent(world, RotateComponent, eid);
  RotateComponent.delete(eid);
}
