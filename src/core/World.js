import { addEntity, createWorld, registerComponents, pipe } from "bitecs";
import { WebGLRenderer, Scene, PerspectiveCamera, Clock } from "three";
import { RendererComponent } from "../components/RendererComponent";
import { initRendererSystem, RendererSystem } from "../systems/RendererSystem";
import {
  Object3DComponent,
  addObject3DEntity,
  initObject3DStorage,
} from "../core/Object3D";
import { addMapComponent } from "../core/MapComponent";

export function createThreeWorld(options = {}) {
  const {
    beforeRenderSystems,
    afterRenderSystems,
    rendererParameters,
    components,
  } = Object.assign(
    {
      beforeRenderSystems: [],
      afterRenderSystems: [],
      rendererParameters: {},
      components: [],
    },
    options
  );

  const world = createWorld();
  initObject3DStorage(world);

  registerComponents(world, [
    RendererComponent,
    Object3DComponent,
    ...components,
  ]);

  const scene = new Scene();
  const sceneEid = addObject3DEntity(world, scene);

  const camera = new PerspectiveCamera();
  const cameraEid = addObject3DEntity(world, camera, scene);

  const rendererEid = addEntity(world);
  const renderer = new WebGLRenderer({
    antialias: true,
    ...rendererParameters,
  });
  renderer.setPixelRatio(window.devicePixelRatio);

  if (!rendererParameters.canvas) {
    document.body.appendChild(renderer.domElement);
  }

  addMapComponent(world, RendererComponent, rendererEid, {
    renderer,
    scene,
    camera,
    needsResize: true,
  });
  initRendererSystem(world);

  const clock = new Clock();

  const pipeline = pipe([
    ...beforeRenderSystems,
    RendererSystem,
    ...afterRenderSystems,
  ]);

  return {
    world,
    sceneEid,
    scene,
    cameraEid,
    camera,
    rendererEid,
    renderer,
    start() {
      renderer.setAnimationLoop(() => {
        world.dt = clock.getDelta();
        world.time = clock.getElapsedTime();
        pipeline(world);
      });
    },
  };
}
