import { createWorld } from "bitecs";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Clock,
  WebGLRendererParameters,
} from "three";
import { RendererSystem } from "../systems/RendererSystem";
import {
  CameraComponent,
  SceneComponent,
  RendererComponent,
} from "../components";
import { ActionMap, ActionMappingSystem } from "../systems/ActionMappingSystem";
import {
  addEntity,
  pipe,
  Component,
  addComponent,
  System,
  World,
  addObject3DEntity,
  addMapComponent,
} from "./ECS";

export type InputMap = Map<string, number>;

interface GLTFWorldOptions {
  systems?: System[];
  afterRenderSystems?: System[];
  rendererParameters?: WebGLRendererParameters;
  actionMaps: ActionMap[];
}

export function createThreeWorld(options: GLTFWorldOptions = {}) {
  const {
    systems,
    afterRenderSystems,
    rendererParameters,
    actionMaps,
  } = Object.assign(
    {
      actionMaps,
      systems: [],
      afterRenderSystems: [],
      rendererParameters: {},
    },
    options
  );

  const world = createWorld() as World;
  world.dt = 0;
  world.time = 0;
  world.objectEntityMap = new Map();
  world.input = new Map();
  world.actionMaps = actionMaps || [];
  world.actions = new Map();
  world.resizeViewport = true;

  function onResize() {
    world.resizeViewport = true;
  }

  window.addEventListener("resize", onResize);

  const scene = new Scene();
  const sceneEid = addObject3DEntity(world, scene);
  addComponent(world, SceneComponent, sceneEid);

  const camera = new PerspectiveCamera();
  const cameraEid = addObject3DEntity(world, camera, scene);
  addComponent(world, CameraComponent, cameraEid);

  const rendererEid = addEntity(world);
  const renderer = new WebGLRenderer({
    antialias: true,
    ...rendererParameters,
  });
  renderer.setPixelRatio(window.devicePixelRatio);

  if (!rendererParameters.canvas) {
    document.body.appendChild(renderer.domElement);
  }

  const canvasParentStyle = renderer.domElement.parentElement!.style;
  canvasParentStyle.position = "relative";

  const canvasStyle = renderer.domElement.style;
  canvasStyle.position = "absolute";
  canvasStyle.width = "100%";
  canvasStyle.height = "100%";

  addMapComponent(world, RendererComponent, rendererEid, renderer);

  window.addEventListener("keydown", (e) => {
    world.input.set(`Keyboard/${e.key.toLowerCase()}`, 1);
  });

  window.addEventListener("keyup", (e) => {
    world.input.set(`Keyboard/${e.key.toLowerCase()}`, 0);
  });

  window.addEventListener("mousemove", (e) => {
    world.input.set("Mouse/movementX", e.movementX);
    world.input.set("Mouse/movementY", e.movementY);
  });

  window.addEventListener("blur", () => {
    for (const key of world.input.keys()) {
      world.input.set(key, 0);
    }
  });

  const clock = new Clock();

  const pipeline = pipe(
    ActionMappingSystem,
    ...systems,
    RendererSystem,
    ...afterRenderSystems
  );

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
