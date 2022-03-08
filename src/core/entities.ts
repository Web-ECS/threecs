import {
  Object3DSoAoA, Object3DSoA,
  Vector3ProxySoA, Vector3ProxyAoA,
  EulerProxyAoA, EulerProxySoA,
  QuaternionProxyAoA, QuaternionProxySoA,
} from "@webecs/do-three";
import { addComponent, addEntity, defineComponent, hasComponent, removeComponent, Types } from "bitecs";
import { BufferGeometry, Material, Mesh, Object3D, Scene, Vector3, Bone, PerspectiveCamera, Group, InstancedMesh, DynamicDrawUsage, Line, LineLoop, LineSegments, PointLight, Points, SkinnedMesh, SpotLight, OrthographicCamera } from "three";
import { Object3DComponent, VisibleComponent, CameraComponent, SceneComponent } from "./components";
import { addMapComponent } from "./ECS";
import { World } from "./World";


export const _addedEvent = { type: 'added' }
export const _removedEvent = { type: 'removed' }

type Constructor<T, S = {}> = { new(...args: any[]): T } & S;

type IObject3DProps<T extends Object3D> = {
  store: Object3DSoAoA
  eid: number
  parent: IObject3DEntity<any> | null
  children: IObject3DEntity<any>[]
  isObject3DEntity: true;
  add(child: IObject3DEntity<any>): IObject3DEntity<T>
  remove(child: IObject3DEntity<any>): IObject3DEntity<T>
  removeFromParent(): IObject3DEntity<T>
  attach(object: IObject3DEntity<any>): IObject3DEntity<T>;
  clear(): IObject3DEntity<T>
  getObjectById(id: number): IObject3DEntity<any> | undefined;
  getObjectByName(name: string): IObject3DEntity<any> | undefined;
  getObjectByProperty(name: string, value: string): IObject3DEntity<any> | undefined;
  traverse(callback: (object: IObject3DEntity<any>) => any): void
  traverseVisible(callback: (object: IObject3DEntity<any>) => any): void
  traverseAncestors(callback: (object: IObject3DEntity<any>) => any): void
  copy(source: IObject3DEntity<T>, recursive?: boolean): IObject3DEntity<T>;
  clone(recursive?: boolean): IObject3DEntity<T>;
}

export type IObject3DEntity<T extends Object3D> = Omit<T, keyof IObject3DProps<T>> & IObject3DProps<T>;

interface IObject3DStaticProps {
  DefaultUp: Vector3;
  DefaultMatrixAutoUpdate: boolean;
}

export const Object3DEntityMixin = <T extends Object3D, R extends IObject3DEntity<T>, S extends IObject3DStaticProps>(Base: Constructor<T>): Constructor<R, S> => {

  const TypedBase = Base as any;

  const ReturnType = class extends TypedBase {
    world: World;
    store: Object3DSoAoA;
    eid: number;
    parent: IObject3DEntity<any> | null;
    children: IObject3DEntity<any>[];
    isObject3DEntity: true;
    constructor(world: World, ...args: any[]) {
      super(...args);

      this.world = world;
      this.store = Object3DComponent;
      const eid = this.eid = addEntity(world);

      this.parent = null;
      this.children = [];

      this.store.matrix[eid].set(this.matrix.elements);
      this.matrix.elements = this.store.matrix[eid];

      const position = Array.isArray(this.store.position)
        ? new Vector3ProxyAoA(this.store.position[eid])
        : new Vector3ProxySoA(this.store.position, eid);

      const scale = Array.isArray(this.store.scale)
        ? new Vector3ProxyAoA(this.store.scale[eid])
        : new Vector3ProxySoA(this.store.scale, eid);

      scale.set(1, 1, 1);

      const rotation = Array.isArray(this.store.rotation)
        ? new EulerProxyAoA(this.store.rotation[eid])
        : new EulerProxySoA(this.store.rotation, eid);

      const quaternion = Array.isArray(this.store.quaternion)
        ? new QuaternionProxyAoA(this.store.quaternion[eid])
        : new QuaternionProxySoA(this.store.quaternion, eid);

      function onRotationChange() {
        quaternion.setFromEuler(rotation, false);
      }

      function onQuaternionChange() {
        rotation.setFromQuaternion(quaternion, undefined, false);
      }

      rotation._onChange(onRotationChange);
      quaternion._onChange(onQuaternionChange);

      Object.defineProperties(this, {
        position: { value: position },
        scale: { value: scale },
        rotation: { value: rotation },
        quaternion: { value: quaternion },
      });

      this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
      this.visible = true;

      this.castShadow = false;
      this.receiveShadow = false;

      this.frustumCulled = true;
      this.renderOrder = 0;

      this.isObject3DEntity = true;

      addMapComponent(world, Object3DComponent, eid, this as IObject3DEntity<any>);
      addComponent(world, VisibleComponent, eid);

      Object3D.prototype.updateMatrix.call(this)
    }

    _add(object: any) {
      Object3D.prototype.add.call(this, object);
    }

    _remove(object: any) {
      Object3D.prototype.remove.call(this, object);
    }

    _removeFromParent() {
      Object3D.prototype.removeFromParent.call(this);
    }

    add(child: IObject3DEntity<any>) {
      this._add(child);
      this.store.parent[child.eid] = this.eid;
      const lastChild = this.children[this.children.length - 2];
      if (lastChild !== undefined) {
        this.store.prevSibling[child.eid] = lastChild.eid;
        this.store.nextSibling[lastChild.eid] = child.eid;
      }
      const firstChild = this.children[0];
      if (firstChild) this.store.firstChild[this.eid] = firstChild.eid;
      return this;
    }

    remove(child: IObject3DEntity<any>) {
      const childIndex = this.children.indexOf(child);
      const prevChild = this.children[childIndex - 1];
      const nextChild = this.children[childIndex + 1];

      // [prev, child, next]
      if (prevChild !== undefined && nextChild !== undefined) {
        this.store.nextSibling[prevChild.eid] = nextChild.eid;
        this.store.prevSibling[nextChild.eid] = prevChild.eid;
      }
      // [prev, child]
      if (prevChild !== undefined && nextChild === undefined) {
        this.store.nextSibling[prevChild.eid] = 0
      }
      // [child, next]
      if (nextChild !== undefined && prevChild === undefined) {
        this.store.prevSibling[nextChild.eid] = 0
      }
      this.store.parent[child.eid] = 0;
      this.store.nextSibling[child.eid] = 0;
      this.store.prevSibling[child.eid] = 0;
      this._remove(child);
      const firstChild = this.children[0];
      if (firstChild) this.store.firstChild[this.eid] = firstChild.eid;
      return this;
    }

    removeFromParent() {
      this._removeFromParent();
      this.store.parent[this.eid] = 0;
      return this;
    }

    clear() {
      for (let i = 0; i < this.children.length; i++) {
        // original logic
        const object = this.children[i];
        object.parent = null;
        Object3D.prototype.dispatchEvent.call(this, _removedEvent);
        // new logic: clear linked list in proxy stores
        this.store.parent[object.eid] = 0;
        this.store.prevSibling[object.eid] = 0;
        this.store.nextSibling[object.eid] = 0;
      }
      this.children.length = 0;
      return this;
    }

    traverse(callback: (object: IObject3DEntity<any>) => any): void {
      Object3D.prototype.traverse.call(this, callback as unknown as (object: Object3D) => any);
    }

    get matrixAutoUpdate() {
      if (this.store !== undefined)
        return !!this.store.matrixAutoUpdate[this.eid];
      return true;
    }
    set matrixAutoUpdate(v) {
      if (this.store !== undefined)
        this.store.matrixAutoUpdate[this.eid] = v ? 1 : 0;
    }
    get matrixWorldNeedsUpdate() {
      if (this.store !== undefined)
        return !!this.store.matrixWorldNeedsUpdate[this.eid];
      return false;
    }
    set matrixWorldNeedsUpdate(v) {
      if (this.store !== undefined)
        this.store.matrixWorldNeedsUpdate[this.eid] = v ? 1 : 0;
    }
    get visible() {
      if (this.eid)
        return hasComponent(this.world, VisibleComponent, this.eid);
      return true
    }
    set visible(v) {
      if (this.eid)
        if (v) addComponent(this.world, VisibleComponent, this.eid);
        else removeComponent(this.world, VisibleComponent, this.eid);
    }
    get castShadow() {
      if (this.store !== undefined)
        return !!this.store.castShadow[this.eid];
      return false
    }
    set castShadow(v) {
      if (this.store !== undefined)
        this.store.castShadow[this.eid] = v ? 1 : 0;
    }
    get receiveShadow() {
      if (this.store !== undefined)
        return !!this.store.receiveShadow[this.eid];
      return false
    }
    set receiveShadow(v) {
      if (this.store !== undefined)
        this.store.receiveShadow[this.eid] = v ? 1 : 0;
    }
    get frustumCulled() {
      if (this.store !== undefined)
        return !!this.store.frustumCulled[this.eid];
      return false;
    }
    set frustumCulled(v) {
      if (this.store !== undefined)
        this.store.frustumCulled[this.eid] = v ? 1 : 0;
    }
    get renderOrder() {
      if (this.store !== undefined)
        return this.store.renderOrder[this.eid];
      return 0;
    }
    set renderOrder(v: number) {
      if (this.store !== undefined)
        this.store.renderOrder[this.eid] = v;
    }
  }

  return ReturnType as unknown as Constructor<R, S>;
}

/**
 * Base Object3D Types:
 * Scene
 * 
 * GLTFLoader Object3D Types:
 * Bone
 * Group
 * Line
 * LineLoop
 * LineSegments
 * Mesh
 * Object3D
 * OrthographicCamera
 * PerspectiveCamera
 * PointLight
 * Points
 * SkinnedMesh
 * SpotLight
 * 
 * three-omi Object3D Types:
 * Audio
 * PositionalAudio
 * AudioListener
 * 
 * Additional Object3D Types:
 * LOD?
 */


export class SceneEntity extends Object3DEntityMixin(Scene) {
  constructor(world: World) {
    super(world);
    addComponent(world, SceneComponent, this.eid);
  }
}

export class Object3DEntity extends Object3DEntityMixin(Object3D) {
  constructor(world: World) {
    super(world);
  }
}

const MeshComponent = defineComponent({
  //todo: geometry / material
})
export class MeshEntity extends Object3DEntityMixin(Mesh) {
  constructor(world: World, geometry: BufferGeometry, material: Material | Material[]) {
    super(world, geometry, material);
  }
}

const SkinnedMeshComponent = defineComponent();
export class SkinnedMeshEntity extends Object3DEntityMixin(SkinnedMesh) {
  constructor(world: World) {
    super(world);
    addComponent(world, SkinnedMeshComponent, this.eid);
  }
}

export const InstancedMeshImposterComponent = defineComponent({
  instancedMeshEid: Types.ui32,
  instancedMeshIndex: Types.ui32,
  needsUpdate: Types.ui8,
  autoUpdate: Types.ui8,
});

export class InstancedMeshImposterEntity extends Object3DEntityMixin(Mesh) {
  constructor(world: World, geometry: BufferGeometry, material: Material | Material[], instancedMeshEid: number) {
    super(world, geometry, material);
    this.visible = false;
    addComponent(world, InstancedMeshImposterComponent, this.eid);
    InstancedMeshImposterComponent.instancedMeshEid[this.eid] = instancedMeshEid;
    InstancedMeshImposterComponent.needsUpdate[this.eid] = 1;
    InstancedMeshImposterComponent.autoUpdate[this.eid] = 0;
  }
}

export const InstancedMeshComponent = defineComponent();

export class InstancedMeshEntity extends Object3DEntityMixin(InstancedMesh) {
  constructor(
    world: World,
    geometry: BufferGeometry,
    material: Material,
    count: number,
  ) {
    super(world, geometry, material, count);
    addComponent(world, InstancedMeshComponent, this.eid);
  }
}

const BoneComponent = defineComponent();
export class BoneEntity extends Object3DEntityMixin(Bone) {
  constructor(world: World) {
    super(world);
    addComponent(world, BoneComponent, this.eid);
  }
}

const OrthographicCameraComponent = defineComponent();
export class OrthographicCameraEntity extends Object3DEntityMixin(OrthographicCamera) {
  constructor(world: World) {
    super(world);
    addComponent(world, CameraComponent, this.eid);
    addComponent(world, OrthographicCameraComponent, this.eid);
  }
}

const PerspectiveCameraComponent = defineComponent();
export class PerspectiveCameraEntity extends Object3DEntityMixin(PerspectiveCamera) {
  constructor(world: World) {
    super(world);
    addComponent(world, CameraComponent, this.eid);
    addComponent(world, PerspectiveCameraComponent, this.eid);
  }
}

const GroupComponent = defineComponent();
export class GroupEntity extends Object3DEntityMixin(Group) {
  constructor(world: World) {
    super(world);
    addComponent(world, GroupComponent, this.eid);
  }
}

const LineComponent = defineComponent();
export class LineEntity extends Object3DEntityMixin(Line) {
  constructor(world: World) {
    super(world);
    addComponent(world, LineComponent, this.eid);
  }
}

const LineLoopComponent = defineComponent();
export class LineLoopEntity extends Object3DEntityMixin(LineLoop) {
  constructor(world: World) {
    super(world);
    addComponent(world, LineLoopComponent, this.eid);
  }
}

const LineSegmentsComponent = defineComponent();
export class LineSegmentsEntity extends Object3DEntityMixin(LineSegments) {
  constructor(world: World) {
    super(world);
    addComponent(world, LineSegmentsComponent, this.eid);
  }
}

const PointLightComponent = defineComponent();
export class PointLightEntity extends Object3DEntityMixin(PointLight) {
  constructor(world: World) {
    super(world);
    addComponent(world, PointLightComponent, this.eid);
  }
}

const PointsComponent = defineComponent();
export class PointsEntity extends Object3DEntityMixin(Points) {
  constructor(world: World) {
    super(world);
    addComponent(world, PointsComponent, this.eid);
  }
}

const SpotLightComponent = defineComponent();
export class SpotLightEntity extends Object3DEntityMixin(SpotLight) {
  constructor(world: World) {
    super(world);
    addComponent(world, SpotLightComponent, this.eid);
  }
}