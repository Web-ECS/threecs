import { addComponent, defineComponent, removeComponent } from "bitecs";

export const RendererComponent = defineComponent(new Map());

export function addRendererComponent(world, eid, renderer, scene, camera) {
  addComponent(world, RendererComponent, eid);
  RendererComponent.set(eid, {
    renderer,
    scene,
    camera,
    needsResize: true,
  });
}

export function removeRendererComponent(world, eid) {
  removeComponent(world, RendererComponent, eid);
  RendererComponent.delete(eid);
}
