import { Types, defineComponent, ISchema, ListType } from "bitecs";
import { defineProxyComponent } from "./ECS";
import { IObject3DEntity } from "./proxy/Object3DEntityMixin";
import { Object3DSoAoA } from "./proxy/Types";

const { f32, ui32, ui8 } = Types

const Vector3Schema: ListType = [f32, 3]
const Vector4Schema: ListType = [f32, 4]
const Matrix4Schema: ListType = [f32, 16]

const Object3DSchema: ISchema = {
  position: Vector3Schema,
  scale: Vector3Schema,
  rotation: Vector4Schema,
  quaternion: Vector4Schema,

  id: ui32,
  parent: ui32,
  firstChild: ui32,
  prevSibling: ui32,
  nextSibling: ui32,

  matrix: Matrix4Schema,
  matrixWorld: Matrix4Schema,

  matrixAutoUpdate: ui8,
  matrixWorldNeedsUpdate: ui8,

  layers: ui32,
  visible: ui8,
  castShadow: ui8,
  receiveShadow: ui8,
  frustumCulled: ui8,
  renderOrder: f32,
}

export const Object3DComponent = defineProxyComponent<Object3DSoAoA, IObject3DEntity<any>>(Object3DSchema);

export const VisibleComponent = defineComponent();