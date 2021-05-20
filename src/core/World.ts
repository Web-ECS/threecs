import { createWorld } from "bitecs";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Clock,
  WebGLRendererParameters,
} from "three";
import { RendererSystem, RendererComponent } from "../systems/RendererSystem";
import { CameraComponent, SceneComponent } from "../components";
import { ActionMappingSystem, ActionMap } from "../systems/ActionMappingSystem";
import {
  addEntity,
  pipe,
  addComponent,
  System,
  World,
  addObject3DEntity,
  addMapComponent,
} from "./ECS";

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
        world.input.set("Mouse/movementX", 0);
        world.input.set("Mouse/movementY", 0);
      });
    },
  };
}
