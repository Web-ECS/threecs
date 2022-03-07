import { setQuaternionFromEulerAoA } from "@webecs/do-three";
import { Object3DComponent } from "./components";

export const updateQuaternion = (eid: number) =>
  setQuaternionFromEulerAoA(
    Object3DComponent.quaternion[eid],
    Object3DComponent.rotation[eid]
  )

export const setFromAxisAngle = (eid: number, axis: Float32Array, angle: number) => {
  const rotation = Object3DComponent.rotation[eid]
  const quaternion = Object3DComponent.quaternion[eid]
  const halfAngle = angle / 2, s = Math.sin(halfAngle);
  quaternion[0] = axis[0] * s;
  quaternion[1] = axis[1] * s;
  quaternion[2] = axis[2] * s;
  quaternion[3] = Math.cos(halfAngle);
  // todo: set rotation
}
