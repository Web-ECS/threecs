import {
  addEntity,
  createWorld,
  defineQuery,
  defineSystem,
  registerComponents,
  pipe,
} from "bitecs";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Clock,
  Mesh,
  BoxBufferGeometry,
  Material,
  MeshBasicMaterial,
  Vector3,
} from "three";
import {
  RendererComponent,
  RendererMap,
  addRendererComponent,
  getRendererScene,
  getRendererCamera,
} from "./components/Renderer";
import {
  Object3DComponent,
  Object3DMap,
  addObject3DComponent,
} from "./components/Object3D";
import {
  RotateComponent,
  AxisMap,
  addRotateComponent,
} from "./components/Rotate";

const world = createWorld();

const rendererQuery = defineQuery([RendererComponent]);

const RendererSystem = defineSystem(rendererQuery, (entities) => {
  entities.forEach((eid) => {
    const scene = getRendererScene(eid);
    const camera = getRendererCamera(eid);
    const renderer = RendererMap.get(eid);

    if (scene && camera) {
      renderer.render(scene, camera);
    }
  });
});

const rotateQuery = defineQuery([RotateComponent, Object3DComponent]);

const RotateSystem = defineSystem(rotateQuery, (entities) => {
  entities.forEach((eid) => {
    const dt = world.dt;
    const object3D = Object3DMap.get(eid);
    const speed = RotateComponent.speed[eid];
    const axis = AxisMap.get(eid);
    object3D.rotateOnAxis(axis, speed * dt);
  });
});

registerComponents(world, [
  RendererComponent,
  Object3DComponent,
  RotateComponent,
]);

const canvas = document.getElementById("canvas");
const rendererEid = addEntity(world);
const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
addRendererComponent(world, rendererEid, renderer);

const sceneEid = addEntity(world);
const scene = new Scene();
addObject3DComponent(world, sceneEid, scene);
RendererComponent.sceneEid[rendererEid] = sceneEid;

const cameraEid = addEntity(world);
const camera = new PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight
);
camera.position.z = 5;
addObject3DComponent(world, cameraEid, camera);
RendererComponent.cameraEid[rendererEid] = cameraEid;

const cubeEid = addEntity(world);
const cube = new Mesh(new BoxBufferGeometry(), new MeshBasicMaterial());
addRotateComponent(world, cubeEid, new Vector3(0.5, 1, 0), 1);
addObject3DComponent(world, cubeEid, cube);
scene.add(cube);

const pipeline = pipe([RotateSystem, RendererSystem]);

const clock = new Clock();

renderer.setAnimationLoop(() => {
  world.dt = clock.getDelta();
  pipeline(world);
});
