import { MeshProxy, Object3DEntity, Object3DProxy, Object3DSoAoA } from "@webecs/do-three";
import {
  Object3D,
  InstancedMesh,
  Material,
  Mesh,
  BufferGeometry,
  DynamicDrawUsage,
} from "three";
import { Object3DComponent } from "../core/components";
import {
  defineComponent,
  defineQuery,
  addObject3DEntity,
  addComponent,
  addEntity,
  addObject3DComponent,
  addMapComponent,
  setParentEntity,
} from "../core/ECS";
import { MeshEntity } from "../core/entities";
import { World } from '../core/World'

// todo: replace with addMeshEntity or addObject3DEntity because geom/mat is shared for instanced objects
export class InstancedMeshImposter extends MeshProxy {
  constructor(store: Object3DSoAoA, eid: number, geometry: BufferGeometry, material: Material | Material[]) {
    super(store, eid, geometry, material);
  }
}

export class InstancedMeshRenderer extends InstancedMesh {
  instances: MeshProxy[];
  isInstancedMeshRenderer: boolean;

  constructor(
    geometry: BufferGeometry,
    material: Material,
    maxInstances: number = 100
  ) {
    super(geometry, material, maxInstances);
    this.instanceMatrix.setUsage(DynamicDrawUsage);
    this.isInstancedMeshRenderer = true;
    this.instances = [];
  }

  createInstance(eid: number) {
    const mesh = new InstancedMeshImposter(
      Object3DComponent,
      eid,
      this.geometry,
      this.material
    );
    this.instances.push(mesh);
    return mesh;
  }

  removeInstance(mesh: InstancedMeshImposter): boolean {
    const idx = this.instances.indexOf(mesh);

    if (idx === -1) {
      return false;
    }

    this.instances.splice(idx, 1);

    return true;
  }

  update() {
    this.count = this.instances.length;

    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      instance.updateMatrixWorld();
      this.setMatrixAt(i, instance.matrixWorld);
    }

    this.instanceMatrix.needsUpdate = true;
  }
}

export const InstancedMeshRendererComponent = defineComponent();

export function addInstancedMeshRendererEntity(
  world: World,
  geometry: BufferGeometry,
  material: Material,
  maxInstances: number = 100,
  parent?: number
) {
  const instancedMeshRenderer = new InstancedMeshRenderer(
    geometry,
    material,
    maxInstances
  ) as unknown as Object3DEntity;
  const eid = addEntity(world);
  // const instancedMeshRendererEid = addObject3DEntity(
  //   world,
  //   instancedMeshRenderer,
  //   parent
  // );
  // addMapComponent(world, Object3DComponent, eid, instancedMeshRenderer);
  addObject3DComponent(world, eid, instancedMeshRenderer, parent)
  addComponent(world, InstancedMeshRendererComponent, eid);

  return eid;
}

export function addInstancedMeshImposterEntity(
  world: World,
  instancedMeshRenderer: InstancedMeshRenderer,
  parent?: number
) {
  const eid = addEntity(world);
  const obj = instancedMeshRenderer.createInstance(eid);
  addObject3DComponent(world, eid, obj, parent);
  // const eid = addObject3DEntity(world, obj, parent);
  return eid;
}

const instancedMeshRendererQuery = defineQuery([
  InstancedMeshRendererComponent,
  Object3DComponent,
]);

export const InstancedMeshRendererSystem =
  function InstancedMeshRendererSystem(world: World) {
    const entities = instancedMeshRendererQuery(world);

    entities.forEach((eid) => {
      const obj = Object3DComponent.store.get(eid) as unknown as InstancedMeshRenderer;

      if (!obj.isInstancedMeshRenderer) {
        return;
      }

      obj.update();
    });

    return world;
  };
