import {
  IComponent,
  defineComponent,
  removeEntity,
  addComponent,
  removeComponent,
  ISchema,
  Query,
  defineQuery,
  exitQuery,
  defineSystem,
} from "bitecs";
import { Object3DComponent } from "./components";
import { World } from './World'
import { maxEntities } from "./config";
import { traverse } from "./util/traverse";

export * from 'bitecs'

/* threecs API */

export type MapComponent<V> = IComponent & { store: Map<number, V>, disposeSystem: (world: World) => World };

export function defineMapComponent<V>(schema?: ISchema, disposeCallback?: (object: V, eid: number) => void): MapComponent<V> {
  const component = defineComponent(schema) as MapComponent<V>;
  component.store = new Map();

  const exit = exitQuery(defineQuery([component]))
  component.disposeSystem = defineSystem((world: World) => {
    const entities = exit(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const obj = component.store.get(eid)! as any
      if (obj.dispose) obj.dispose()
      if (disposeCallback) {
        disposeCallback(obj, eid);
      }
      component.store.delete(eid);
    }
    return world;
  });

  return component;
}

export function addMapComponent<V>(
  world: World,
  component: MapComponent<V>,
  eid: number,
  value: V
) {
  addComponent(world, component, eid, false);
  const obj = component.store.get(eid)
  if (obj) Object.assign(obj, value);
  else component.store.set(eid, value);
}

export function removeMapComponent(
  world: World,
  component: MapComponent<any>,
  eid: number
) {
  removeComponent(world, component, eid);
}

export function defineProxyComponent<SoA, Proxy>(schema: ISchema): SoA & MapComponent<Proxy> {
  // TODO update bitecs type def
  // @ts-ignore
  return defineMapComponent(schema, maxEntities) as SoA & MapComponent<Proxy>;
}

export const setParentEntity = (child: number, parent: number) => {
  const p = Object3DComponent.store.get(parent)!
  const c = Object3DComponent.store.get(child)!
  p.add(c)
}

export const setChildEntity = (parent: number, child: number) => {
  setParentEntity(child, parent);
}

export function removeObject3DEntity(world: World, eid: number) {
  const obj = Object3DComponent.store.get(eid)

  if (!obj) {
    return;
  }

  if (obj.parent) {
    obj.parent.remove(obj);
  }

  traverse(obj.eid, (eid: number) => {
    removeEntity(world, eid);
  });
}

export function singletonQuery(
  query: Query
): (world: World) => number | undefined {
  return (world: World) => {
    const entities = query(world);
    return entities.length > 0 ? entities[0] : undefined;
  };
}
