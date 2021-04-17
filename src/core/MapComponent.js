import { addComponent, removeComponent } from "bitecs";

export function addMapComponent(world, component, eid, value) {
  addComponent(world, component, eid);
  component.set(eid, value);
}

export function removeMapComponent(world, component, eid) {
  removeComponent(world, component, eid);
  component.delete(eid);
}
