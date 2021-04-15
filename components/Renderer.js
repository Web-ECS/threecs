import { addComponent, defineComponent, removeComponent } from "bitecs";

export const RendererComponent = defineComponent(new Map());

export function addRendererComponent(world, eid, renderer, scene, camera) {
  RendererComponent.set(eid, {
    renderer,
    scene,
    camera,
    needsResize: true,
  });
  addComponent(world, RendererComponent, eid);
  return component;
}

export function removeRendererComponent(world, eid) {
  RendererComponent.delete(eid);
  removeComponent(world, RendererComponent, eid);
}
