import { createWorld, IWorld } from "bitecs";
import {
  WebGLRenderer,
  Clock,
  WebGLRendererParameters,
} from "three";
import { RendererSystem } from "../systems/RendererSystem";
import { ActionMappingSystem, ActionMap, ActionState } from "../systems/ActionMappingSystem";
import {
  addEntity,
  pipe,
  System,
} from "./ECS";
import { maxEntities } from "./config";
import { OrthographicCameraEntity, PerspectiveCameraEntity, SceneEntity, } from "./entities";
import { Object3DComponent } from "./components";
import { initInput } from "./input";
import { InputResetSystem } from "../systems/InputResetSystem";

export interface World extends IWorld {
  dt: number;
  time: number;
  elapsed: number;
  input: Map<string, number>;
  actionMaps: ActionMap[];
  actions: Map<string, ActionState>;
  scene: SceneEntity;
  camera: PerspectiveCameraEntity | OrthographicCameraEntity;
  renderer: WebGLRenderer;
  resizeViewport: boolean;
}

interface GLTFWorldOptions {
  pointerLock?: boolean;
  systems?: System[];
  afterRenderSystems?: System[];
  rendererParameters?: WebGLRendererParameters;
  actionMaps?: ActionMap[];
}

export function createThreeWorld(options: GLTFWorldOptions = {}) {
  const {
    pointerLock,
    systems,
    afterRenderSystems,
    rendererParameters,
    actionMaps,
  } = Object.assign(
    {
      pointerLock: false,
      actionMaps: [],
      systems: [],
      afterRenderSystems: [],
      rendererParameters: {},
    },
    options
  );

  const world = createWorld<World>(maxEntities);
  world.dt = 0;
  world.time = 0;
  world.input = new Map();
  world.actionMaps = actionMaps || [];
  world.actions = new Map();
  world.resizeViewport = true;

  function onResize() {
    world.resizeViewport = true;
  }

  window.addEventListener("resize", onResize);

  // noop entity 0
  const noop = addEntity(world);

  const scene = new SceneEntity(world);
  world.scene = scene;

  const camera = new PerspectiveCameraEntity(world);
  world.camera = camera;
  scene.add(camera);

  const renderer = new WebGLRenderer({
    antialias: true,
    ...rendererParameters,
  });

  world.renderer = renderer;

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

  const disposeInput = initInput(world, { pointerLock });

  if (typeof (window as any).__THREE_DEVTOOLS__ !== "undefined") {
    (window as any).__THREE_DEVTOOLS__.dispatchEvent(
      new CustomEvent("observe", { detail: scene })
    );
    (window as any).__THREE_DEVTOOLS__.dispatchEvent(
      new CustomEvent("observe", { detail: renderer })
    );
  }

  const clock = new Clock();

  const pipeline = pipe(
    ActionMappingSystem,
    ...systems,
    RendererSystem,
    ...afterRenderSystems,
    Object3DComponent.disposeSystem,
    InputResetSystem,
  );

  return {
    world,
    start() {
      renderer.setAnimationLoop(() => {
        world.dt = clock.getDelta();
        world.time = clock.getElapsedTime();
        pipeline(world);
      });
    },
    dispose() {
      disposeInput();
    }
  };
}
