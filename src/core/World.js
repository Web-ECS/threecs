import {
  addEntity,
  createWorld,
  registerComponents,
  pipe,
  addComponent,
} from "bitecs";
import { WebGLRenderer, Scene, PerspectiveCamera, Clock } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { initRendererSystem, RendererSystem } from "../systems/RendererSystem";
import {
  addObject3DEntity,
  initObject3DStorage,
  addObject3DComponent,
} from "../core/Object3D";
import { addMapComponent } from "../core/MapComponent";
import {
  CameraComponent,
  SceneComponent,
  Object3DComponent,
  RendererComponent,
} from "../components";

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
  addMapComponent(world, SceneComponent, sceneEid);

  const camera = new PerspectiveCamera();
  const cameraEid = addObject3DEntity(world, camera, scene);
  addMapComponent(world, CameraComponent, cameraEid);

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

const EntityTargets = {
  scene: "sceneEid",
  camera: "cameraEid",
  renderer: "rendererEid",
};

const PropertyInflators = {
  position: (_world, eid, value) => {
    const obj = Object3DComponent.get(eid);
    obj.position.copy(value);
  },
};

export function bootstrapThreeWorld(worldDef) {
  const { entities, ...worldOptions } = worldDef;

  const ctx = createThreeWorld(worldOptions);

  const world = ctx.world;

  function inflateEntity(entityDef, parentEid = null) {
    let eid;

    if (entityDef.target) {
      const ctxKey = EntityTargets[entityDef.target];

      if (!Object.prototype.hasOwnProperty.call(ctx, ctxKey)) {
        throw new Error(`Couldn't find entity target "${entityDef.target}"`);
      }

      eid = ctx[ctxKey];
    } else {
      eid = addEntity(world);
    }

    if (entityDef.object3D) {
      addObject3DComponent(world, eid, entityDef.object3D);
    }

    for (const key in entityDef) {
      if (!Object.prototype.hasOwnProperty.call(entityDef, key)) {
        continue;
      }

      const inflator = PropertyInflators[key];

      if (inflator) {
        inflator(world, eid, entityDef[key]);
      }
    }

    if (entityDef.components) {
      for (const [component, props] of entityDef.components) {
        addComponent(world, component, eid);

        if (component instanceof Map) {
          component.set(eid, props);
        } else {
          console.log(component);
          component._set(eid, props);
        }
      }
    }

    const obj = Object3DComponent.get(eid);
    const parentObj = Object3DComponent.get(parentEid);

    if (obj && parentObj) {
      parentObj.add(obj);
    }

    if (entityDef.children) {
      for (const childDef of entityDef.children) {
        inflateEntity(childDef, eid);
      }
    }
  }

  if (entities) {
    for (const entityDef of entities) {
      inflateEntity(entityDef);
    }
  }

  ctx.start();

  return world;
}

function ThreecsGLTFLoaderPlugin(parser, world) {
  return {
    async afterRoot(gltf) {
      console.log(gltf);
    },
  };
}

export async function createWorldFromGLTF(gltfSrc, options) {
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

  const pipeline = pipe([
    ...beforeRenderSystems,
    RendererSystem,
    ...afterRenderSystems,
  ]);

  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.register((parser) => ThreecsGLTFLoaderPlugin(parser, world));
  const { scene, cameras } = await gltfLoader.loadAsync(gltfSrc);

  if (!scene) {
    throw new Error("glTF has no scene");
  }

  const sceneEid = addObject3DEntity(world, scene);
  addMapComponent(world, SceneComponent, sceneEid);

  let camera;

  if (cameras.length > 0) {
    camera = cameras[0];
  } else {
    camera = new PerspectiveCamera();
  }

  const cameraEid = addObject3DEntity(world, camera);
  addMapComponent(world, CameraComponent, cameraEid);

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
