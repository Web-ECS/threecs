import { Types, addComponent, defineComponent, removeComponent } from "bitecs";
import { Object3DMap } from "./Object3D";

export const RendererMap = new Map();

export const RendererComponent = defineComponent({
  sceneEid: Types.ui32,
  cameraEid: Types.ui32
});

export function addRendererComponent(world, eid, renderer, sceneEid = 0, cameraEid = 0) {
  RendererMap.set(eid, renderer);
  addComponent(world, RendererComponent, eid);
  RendererComponent.sceneEid[eid] = sceneEid;
  RendererComponent.cameraEid[eid] = cameraEid;
}

export function removeRendererComponent(world, eid) {
  RendererMap.delete(eid);
  RendererComponent.sceneEid[eid] = 0;
  RendererComponent.cameraEid[eid] = 0;
  removeComponent(world, RendererComponent, eid);
}

export function getRendererScene(eid) {
  const sceneEid = RendererComponent.sceneEid[eid];
  return Object3DMap.get(sceneEid);
}

export function getRendererCamera(eid) {
  const cameraEid = RendererComponent.cameraEid[eid];
  return Object3DMap.get(cameraEid);
}