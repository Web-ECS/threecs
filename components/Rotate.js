import { defineComponent, Types, addComponent, removeComponent } from "bitecs";

export const AxisMap = new Map();

export const RotateComponent = defineComponent({
  speed: Types.f32
});

export function addRotateComponent(world, eid, axis, speed) {
  AxisMap.set(eid, axis);
  addComponent(world, RotateComponent, eid);
  RotateComponent.speed[eid] = speed;
}

export function removeRotateComponent(world, eid) {
  AxisMap.delete(eid);
  RotateComponent.speed[eid] = 0;
  removeComponent(world, RotateComponent, eid);
}
