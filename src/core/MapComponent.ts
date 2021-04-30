import {
  addComponent,
  removeComponent,
  defineComponent,
  IComponent,
  IWorld,
} from "bitecs";

type IMapComponent<V> = IComponent & { storage: Map<number, V> };

export function defineMapComponent<V>(): IMapComponent<V> {
  const component = defineComponent({});
  (component as any).storage = new Map();
  return component as IMapComponent<V>;
}

export function addMapComponent<V>(
  world: IWorld,
  component: IMapComponent<V>,
  eid: number,
  value: V
) {
  addComponent(world, component, eid);
  component.storage.set(eid, value);
}

export function removeMapComponent(
  world: IWorld,
  component: IMapComponent<any>,
  eid: number
) {
  removeComponent(world, component, eid);
  component.storage.delete(eid);
}
