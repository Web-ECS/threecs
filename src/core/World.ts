import {
  addEntity,
  createWorld,
  registerComponents,
  pipe,
  addComponent,
  System,
  IComponent,
  IWorld,
} from "bitecs";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Clock,
  WebGLRendererParameters,
} from "three";
import {
  GLTF,
  GLTFLoader,
  GLTFParser,
} from "three/examples/jsm/loaders/GLTFLoader";
import { initRendererSystem, RendererSystem } from "../systems/RendererSystem";
import { addObject3DEntity, initObject3DStorage } from "../core/Object3D";
import { addMapComponent } from "../core/MapComponent";
import {
  CameraComponent,
  SceneComponent,
  Object3DComponent,
  RendererComponent,
} from "../components";

interface GLTFWorldOptions {
  beforeRenderSystems?: System[];
  afterRenderSystems?: System[];
  rendererParameters?: WebGLRendererParameters;
  components?: IComponent[];
}

export function createThreeWorld(options: GLTFWorldOptions = {}) {
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

  addMapComponent(world, RendererComponent, rendererEid, {
    renderer,
    needsResize: true,
  });
  initRendererSystem(world);

  const clock = new Clock();

  const pipeline = pipe(
    ...beforeRenderSystems,
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

function ThreecsGLTFLoaderPlugin(parser: GLTFParser, world: IWorld) {
  return {
    async afterRoot(gltf: GLTF) {
      console.log(gltf);
    },
  };
}

export async function createWorldFromGLTF(
  gltfSrc: string,
  options?: GLTFWorldOptions
) {
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

  const renderer = new WebGLRenderer({
    antialias: true,
    ...rendererParameters,
  });
  renderer.setPixelRatio(window.devicePixelRatio);

  if (!rendererParameters.canvas) {
    document.body.appendChild(renderer.domElement);
  }

  initRendererSystem(world);

  const clock = new Clock();

  const pipeline = pipe(
    ...beforeRenderSystems,
    RendererSystem,
    ...afterRenderSystems
  );

  const gltfLoader = new GLTFLoader();
  gltfLoader.register((parser) => ThreecsGLTFLoaderPlugin(parser, world));
  const { scene, cameras } = await gltfLoader.loadAsync(gltfSrc);

  if (!scene) {
    throw new Error("glTF has no scene");
  }

  const sceneEid = addObject3DEntity(world, scene);
  addComponent(world, SceneComponent, sceneEid);

  let camera;

  if (cameras.length > 0) {
    camera = cameras[0];
  } else {
    camera = new PerspectiveCamera();
  }

  const cameraEid = addObject3DEntity(world, camera);
  addComponent(world, CameraComponent, cameraEid);

  const rendererEid = addEntity(world);
  addMapComponent(world, RendererComponent, rendererEid, {
    renderer,
    needsResize: true,
  });

  renderer.setAnimationLoop(() => {
    world.dt = clock.getDelta();
    world.time = clock.getElapsedTime();
    pipeline(world);
  });

  return world;
}
