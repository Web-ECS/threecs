import { Vector3SoA } from ".."

export const setMatrixPositionSoA = (matrix: Float32Array, position: Vector3SoA, eid: number) => {
  matrix[ 12 ] = position.x[eid]
  matrix[ 13 ] = position.y[eid]
  matrix[ 14 ] = position.z[eid]
}

export const setMatrixPositionAoA = (matrix: Float32Array, position: Float32Array) => {
  matrix[ 12 ] = position[0]
  matrix[ 13 ] = position[1]
  matrix[ 14 ] = position[2]
}