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
  addComponent,
  addEntity,
  addMapComponent,
  setParentEntity,
} from "../core/ECS";
import { MeshEntity, Object3DEntity, InstancedMeshImposterEntity, InstancedMeshComponent, InstancedMeshImposterComponent, InstancedMeshEntity } from "../core/entities";
import { World } from '../core/World'

const instancedMeshImposterQuery = defineQuery([
  InstancedMeshImposterComponent,
  Object3DComponent,
]);

export const InstancedMeshImposterSystem =
  function InstancedMeshImposterSystem(world: World) {
    const entities = instancedMeshImposterQuery(world);

    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const needsUpdate = InstancedMeshImposterComponent.needsUpdate[eid];
      const autoUpdate = InstancedMeshImposterComponent.autoUpdate[eid];

      if (needsUpdate) {
        const instancedMeshEid = InstancedMeshImposterComponent.instancedMeshEid[eid];
        const index = InstancedMeshImposterComponent.instancedMeshIndex[eid];
        const instancedMeshImposter = Object3DComponent.store.get(eid) as InstancedMeshImposterEntity;
        const instancedMesh = Object3DComponent.store.get(instancedMeshEid) as InstancedMeshEntity;
        instancedMeshImposter.updateMatrixWorld();
        instancedMesh.setMatrixAt(index, instancedMeshImposter.matrixWorld);
        instancedMesh.instanceMatrix.needsUpdate = true;
      }


      if (autoUpdate) {
        InstancedMeshImposterComponent.needsUpdate[eid] = 1;
      }
    };

    return world;
  };
