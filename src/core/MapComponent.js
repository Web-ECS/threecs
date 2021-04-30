import { addComponent, removeComponent, defineComponent } from "bitecs";

export function defineMapComponent() {
  const component = defineComponent({});
  component.storage = new Map();
  return component;
}

export function addMapComponent(world, component, eid, value) {
  addComponent(world, component, eid);
  component.storage.set(eid, value);
}

export function removeMapComponent(world, component, eid) {
  removeComponent(world, component, eid);
  component.storage.delete(eid);
}
