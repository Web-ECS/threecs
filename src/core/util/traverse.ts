import { Object3DComponent } from "../components";

export const traverse = (eid: number, cb: Function) => {
  cb(eid);
  let nextChild = Object3DComponent.firstChild[eid];
  while (nextChild) {
    cb(nextChild);
    nextChild = Object3DComponent.nextSibling[nextChild];
  }
}