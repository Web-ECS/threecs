import { defineQuery, defineSystem, IWorld } from "bitecs";
import { PerspectiveCamera } from "three";
import {
  CameraComponent,
  SceneComponent,
  RendererComponent,
} from "../components";
import { Object3DComponent } from "../components";

export const rendererQuery = defineQuery([RendererComponent]);
export const sceneQuery = defineQuery([Object3DComponent, SceneComponent]);
export const cameraQuery = defineQuery([Object3DComponent, CameraComponent]);

export function initRendererSystem(world: IWorld) {
  function onResize() {
    const entities = rendererQuery(world);

    entities.forEach((eid) => {
      const component = RendererComponent.storage.get(eid)!;
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
    const rendererComponent = RendererComponent.storage.get(rendererEid)!;
    const { renderer, needsResize } = rendererComponent;

    const sceneEid = scenes[0];
    const scene = Object3DComponent.storage.get(sceneEid);

    const cameraEid = cameras[0];
    const camera = Object3DComponent.storage.get(
      cameraEid
    ) as PerspectiveCamera;

    if (scene && camera) {
      if (needsResize) {
        const canvasParent = renderer.domElement.parentElement as HTMLElement;

        if (camera.isPerspectiveCamera) {
          camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
          camera.updateProjectionMatrix();
        }

        renderer.setSize(
          canvasParent.clientWidth,
          canvasParent.clientHeight,
          false
        );

        rendererComponent.needsResize = false;
      }

      renderer.render(scene, camera);
    }
  }
});
