import { defineComponent, addComponent, removeComponent } from "bitecs";

export const RotateComponent = defineComponent(new Map());

export function addRotateComponent(world, eid, axis, speed) {
  RotateComponent.set(eid, { axis, speed });
  addComponent(world, RotateComponent, eid);
}

export function removeRotateComponent(world, eid) {
  RotateComponent.delete(eid);
  removeComponent(world, RotateComponent, eid);
}
