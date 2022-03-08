import { PerspectiveCamera, WebGLRenderer, Scene } from "three";
import { CameraComponent, SceneComponent } from "../core/components";
import { Object3DComponent } from "../core/components";
import {
  defineQuery,
  singletonQuery,
  defineSystem,
  defineMapComponent,
} from "../core/ECS";
import { World } from '../core/World'

export const RendererComponent = defineMapComponent<WebGLRenderer>();

export const sceneQuery = defineQuery([Object3DComponent, SceneComponent]);
export const mainSceneQuery = singletonQuery(sceneQuery);
export const cameraQuery = defineQuery([Object3DComponent, CameraComponent]);

export const RendererSystem = function RendererSystem(
  world: World
) {
  const { renderer } = world;
  const scenes = sceneQuery(world);
  const cameras = cameraQuery(world);

  if (scenes.length > 0 && cameras.length > 0) {
    const sceneEid = scenes[0];
    const scene = Object3DComponent.store.get(sceneEid);

    const cameraEid = cameras[0];
    const camera = Object3DComponent.store.get(
      cameraEid
    ) as unknown as PerspectiveCamera;

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

      renderer.render(scene as unknown as Scene, camera);
    }
  }

  return world;
};
