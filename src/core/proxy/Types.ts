import { EulerSoA } from "./Euler";
import { QuaternionSoA } from "./Quaternion";
import { Vector3SoA } from "./Vector3";

export type TransformSoA = {
  position: Vector3SoA
  rotation: EulerSoA
  scale: Vector3SoA
  quaternion: QuaternionSoA
  up: Vector3SoA,
}

export type TransformSoAoA = {
  position: Float32Array[]
  rotation: Float32Array[]
  scale: Float32Array[]
  quaternion: Float32Array[]
  up: Float32Array[]
}

export type Object3DStoreBase = {
  id: Uint32Array | Int32Array,
  parent: Uint32Array | Int32Array,
  firstChild: Uint32Array | Int32Array,
  prevSibling: Uint32Array | Int32Array,
  nextSibling: Uint32Array | Int32Array,
  modelViewMatrix: Float32Array[],
  normalMatrix: Float32Array[],
  matrix: Float32Array[],
  matrixWorld: Float32Array[],
  matrixAutoUpdate: Uint8Array,
  matrixWorldNeedsUpdate: Uint8Array,
  layers: Uint32Array | Int32Array,
  visible: Uint8Array,
  castShadow: Uint8Array,
  receiveShadow: Uint8Array,
  frustumCulled: Uint8Array,
  renderOrder: Float32Array,
}

export type Object3DSoA = TransformSoA & Object3DStoreBase

export type Object3DSoAoA = TransformSoAoA & Object3DStoreBase
