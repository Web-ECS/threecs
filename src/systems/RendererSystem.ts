import { PerspectiveCamera } from "three";
import {
  CameraComponent,
  SceneComponent,
  RendererComponent,
} from "../components";
import { Object3DComponent } from "../components";
import { World, defineQuery, defineSystem } from "../core/ECS";

export const rendererQuery = defineQuery([RendererComponent]);
export const sceneQuery = defineQuery([Object3DComponent, SceneComponent]);
export const cameraQuery = defineQuery([Object3DComponent, CameraComponent]);

export const RendererSystem = defineSystem((world: World) => {
  const renderers = rendererQuery(world);
  const scenes = sceneQuery(world);
  const cameras = cameraQuery(world);

  if (renderers.length > 0 && scenes.length > 0 && cameras.length > 0) {
    const rendererEid = renderers[0];
    const renderer = RendererComponent.storage.get(rendererEid)!;

    const sceneEid = scenes[0];
    const scene = Object3DComponent.storage.get(sceneEid);

    const cameraEid = cameras[0];
    const camera = Object3DComponent.storage.get(
      cameraEid
    ) as PerspectiveCamera;

    if (scene && camera) {
      if (world.resizeViewport) {
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

        world.resizeViewport = false;
      }

      renderer.render(scene, camera);
    }
  }
});
