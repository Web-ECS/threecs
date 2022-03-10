import { Object3DSoA, Object3DSoAoA } from "../type/Object3D";
import { multiplyMatrices } from "./multiplyMatrices";
import { updateMatrixAoA, updateMatrixSoA } from "./updateMatrix";

const updateWorldMatrix = (store: Object3DSoA | Object3DSoAoA, eid: number, force: boolean = false) => {

  if (store.matrixWorldNeedsUpdate[eid] || force) {
    if (store.parent[eid] === 0) {
      store.matrixWorld[eid].set(store.matrix[eid])
    } else {
      const parentEid = store.parent[eid]
      multiplyMatrices(store.matrixWorld[eid], store.matrixWorld[parentEid], store.matrix[eid])
    }
    store.matrixWorldNeedsUpdate[eid] = 0
    force = true
  }
  return force
}

export const updateMatrixWorldSoA = (store: Object3DSoA, eid: number, force: boolean = false) => {
  
  // if (store.matrixAutoUpdate[eid]) 
  updateMatrixSoA(store, eid)
  
  force = updateWorldMatrix(store, eid, force)
  // console.log('updateMatrixWorldSoA', eid, force)
  
  let nextChild = store.firstChild[eid]
  // console.log(nextChild)
  while (nextChild) {
    
    updateMatrixWorldSoA(store, nextChild, force)
    
    // console.log('updateMatrixWorldSoA', nextChild, force)

    nextChild = store.nextSibling[nextChild]
  }

}

export const updateMatrixWorldAoA = (store: Object3DSoAoA, eid: number, force: boolean = false) => {

  if (store.matrixAutoUpdate[eid]) updateMatrixAoA(store, eid)

  force = updateWorldMatrix(store, eid, force)

  let nextChild = store.firstChild[eid]
  while (nextChild) {

    updateMatrixWorldAoA(store, nextChild, force)

    nextChild = store.nextSibling[nextChild]
  }

}