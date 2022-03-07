import { createWorld, IWorld } from "bitecs";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Clock,
  WebGLRendererParameters,
  ACESFilmicToneMapping,
  sRGBEncoding,
  Renderer,
  Camera,
} from "three";
import { RendererSystem, RendererComponent } from "../systems/RendererSystem";
// import { CameraComponent, SceneComponent } from "./components";
import { ActionMappingSystem, ActionMap, ActionState } from "../systems/ActionMappingSystem";
import {
  addEntity,
  pipe,
  addComponent,
  System,
  addObject3DEntity,
  addMapComponent,
  addSceneEntity,
  addPerspectiveCameraEntity,
} from "./ECS";
import { Object3DEntity } from "@webecs/do-three";
import { maxEntities } from "./config";
import { CameraComponent, Object3DComponent, SceneComponent } from "./components";

export interface World extends IWorld {
  dt: number;
  time: number;
  input: Map<string, number>;
  actionMaps: ActionMap[];
  actions: Map<string, ActionState>;
  // objectEntityMap: Map<Object3DEntity, number>;
  sceneEid: number;
  cameraEid: number;
  renderer: Renderer;
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
  world.objectEntityMap = new Map();
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

  const sceneEid = addSceneEntity(world);
  world.sceneEid = sceneEid;
  const scene = Object3DComponent.store.get(sceneEid)!

  const cameraEid = addPerspectiveCameraEntity(world);
  world.cameraEid = cameraEid;
  const camera = Object3DComponent.store.get(cameraEid)!

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

  if (pointerLock) {
    renderer.domElement.addEventListener("mousedown", () => {
      renderer.domElement.requestPointerLock();
    });
  }

  window.addEventListener("keydown", (e) => {
    world.input.set(`Keyboard/${e.code}`, 1);
  });

  window.addEventListener("keyup", (e) => {
    world.input.set(`Keyboard/${e.code}`, 0);
  });

  window.addEventListener("mousemove", (e) => {
    if (pointerLock && document.pointerLockElement === renderer.domElement) {
      world.input.set(
        "Mouse/movementX",
        world.input.get("Mouse/movementX")! + e.movementX
      );
      world.input.set(
        "Mouse/movementY",
        world.input.get("Mouse/movementY")! + e.movementY
      );
    }
  });

  window.addEventListener("blur", () => {
    for (const key of world.input.keys()) {
      world.input.set(key, 0);
    }
  });

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
    ...afterRenderSystems
  );

  return {
    world,
    // sceneEid,
    // scene,
    // cameraEid,
    // camera,
    // rendererEid,
    // renderer,
    start() {
      renderer.setAnimationLoop(() => {
        world.dt = clock.getDelta();
        world.time = clock.getElapsedTime();
        pipeline(world);
        world.input.set("Mouse/movementX", 0);
        world.input.set("Mouse/movementY", 0);
      });
    },
  };
}
