import { MeshProxy, Object3DProxy, Object3DSoAoA } from "@webecs/do-three";
import { addComponent, hasComponent, removeComponent } from "bitecs";
import { BufferGeometry, Material } from "three";
import { VisibleComponent } from "./components";
import { World } from "./World";

export class MeshEntity extends MeshProxy {
  world: World
  constructor(world: World, store: Object3DSoAoA, eid: number, geometry: BufferGeometry, material: Material) {
    super(store, eid, geometry, material);
    this.world = world;
    Object.defineProperty(this, 'visible', {
      get() {
        return hasComponent(this.world, VisibleComponent, this.eid);
      },
      set(v) {
        if (v) addComponent(this.world, VisibleComponent, this.eid);
        else removeComponent(this.world, VisibleComponent, this.eid);
      }
    })
  }
}

export class ObjectEntity extends Object3DProxy {
  world: World
  constructor(world: World, store: Object3DSoAoA, eid: number) {
    super(store, eid);
    this.world = world;
    Object.defineProperty(this, 'visible', {
      get() {
        return hasComponent(this.world, VisibleComponent, this.eid);
      },
      set(v) {
        if (v) addComponent(this.world, VisibleComponent, this.eid);
        else removeComponent(this.world, VisibleComponent, this.eid);
      }
    })
  }
}