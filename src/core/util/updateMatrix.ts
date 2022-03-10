import { Object3DSoA, Object3DSoAoA } from "..";
import { composeMatrixAoA, composeMatrixSoA } from "./composeMatrix";

export const updateMatrixSoA = (store: Object3DSoA, eid: number) => {
  composeMatrixSoA(store, eid)
  store.matrixWorldNeedsUpdate[eid] = 1
}

export const updateMatrixAoA = (store: Object3DSoAoA, eid: number) => {
  composeMatrixAoA(store, eid)
  store.matrixWorldNeedsUpdate[eid] = 1
}