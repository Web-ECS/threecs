import { defineQuery, defineSystem } from "bitecs";
import {
  CameraComponent,
  SceneComponent,
  RendererComponent,
} from "../components";
import { Object3DComponent } from "../components";

export const rendererQuery = defineQuery([RendererComponent]);
export const sceneQuery = defineQuery([Object3DComponent, SceneComponent]);
export const cameraQuery = defineQuery([Object3DComponent, CameraComponent]);

export function initRendererSystem(world) {
  function onResize() {
    const entities = rendererQuery(world);

    entities.forEach((eid) => {
      const component = RendererComponent.get(eid);
      component.needsResize = true;
    });
  }

  // TODO: Probably debounce the resize event callback
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("resize", onResize);
  };
}

export const RendererSystem = defineSystem((world) => {
  const renderers = rendererQuery(world);
  const scenes = sceneQuery(world);
  const cameras = cameraQuery(world);

  if (renderers.length > 0 && scenes.length > 0 && cameras.length > 0) {
    const rendererEid = renderers[0];
    const rendererComponent = RendererComponent.storage.get(rendererEid);
    const { renderer, needsResize } = rendererComponent;

    const sceneEid = scenes[0];
    const scene = Object3DComponent.storage.get(sceneEid);

    const cameraEid = cameras[0];
    const camera = Object3DComponent.storage.get(cameraEid);

    if (scene && camera) {
      if (needsResize) {
        if (camera.isPerspectiveCamera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }

        renderer.setSize(window.innerWidth, window.innerHeight);

        rendererComponent.needsResize = false;
      }

      renderer.render(scene, camera);
    }
  }
});
