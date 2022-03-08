import { Object3DSoA, Object3DSoAoA } from ".."

export const composeMatrixSoA = (store: Object3DSoA, eid: number) => {

  const { matrix, quaternion, position, scale } = store

  const te = matrix[eid]

  const x = quaternion.x[eid], y = quaternion.y[eid], z = quaternion.z[eid], w = quaternion.w[eid]
  const x2 = x + x,	y2 = y + y, z2 = z + z
  const xx = x * x2, xy = x * y2, xz = x * z2
  const yy = y * y2, yz = y * z2, zz = z * z2
  const wx = w * x2, wy = w * y2, wz = w * z2

  const sx = scale.x[eid], sy = scale.y[eid], sz = scale.z[eid]

  te[ 0 ] = ( 1 - ( yy + zz ) ) * sx
  te[ 1 ] = ( xy + wz ) * sx
  te[ 2 ] = ( xz - wy ) * sx
  te[ 3 ] = 0

  te[ 4 ] = ( xy - wz ) * sy
  te[ 5 ] = ( 1 - ( xx + zz ) ) * sy
  te[ 6 ] = ( yz + wx ) * sy
  te[ 7 ] = 0

  te[ 8 ] = ( xz + wy ) * sz
  te[ 9 ] = ( yz - wx ) * sz
  te[ 10 ] = ( 1 - ( xx + yy ) ) * sz
  te[ 11 ] = 0

  te[ 12 ] = position.x[eid]
  te[ 13 ] = position.y[eid]
  te[ 14 ] = position.z[eid]
  te[ 15 ] = 1

}

export const composeMatrixAoA = (store: Object3DSoAoA, eid: number) => {

  const position = store.position[eid]
  const quaternion = store.quaternion[eid]
  const scale = store.scale[eid]

  const te = store.matrix[eid]

  const x = quaternion[0], y = quaternion[1], z = quaternion[2], w = quaternion[3]
  const x2 = x + x,	y2 = y + y, z2 = z + z
  const xx = x * x2, xy = x * y2, xz = x * z2
  const yy = y * y2, yz = y * z2, zz = z * z2
  const wx = w * x2, wy = w * y2, wz = w * z2

  const sx = scale[0], sy = scale[1], sz = scale[2]

  te[ 0 ] = ( 1 - ( yy + zz ) ) * sx
  te[ 1 ] = ( xy + wz ) * sx
  te[ 2 ] = ( xz - wy ) * sx
  te[ 3 ] = 0

  te[ 4 ] = ( xy - wz ) * sy
  te[ 5 ] = ( 1 - ( xx + zz ) ) * sy
  te[ 6 ] = ( yz + wx ) * sy
  te[ 7 ] = 0

  te[ 8 ] = ( xz + wy ) * sz
  te[ 9 ] = ( yz - wx ) * sz
  te[ 10 ] = ( 1 - ( xx + yy ) ) * sz
  te[ 11 ] = 0

  te[ 12 ] = position[0]
  te[ 13 ] = position[1]
  te[ 14 ] = position[2]
  te[ 15 ] = 1

}
