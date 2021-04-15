import { addEntity, createWorld, registerComponents, pipe } from "bitecs";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Clock,
  Mesh,
  BoxBufferGeometry,
  MeshBasicMaterial,
  Vector3,
} from "three";
import { RendererComponent, addRendererComponent } from "./components/Renderer";
import { Object3DComponent, addObject3DComponent } from "./components/Object3D";
import { RotateComponent, addRotateComponent } from "./components/Rotate";
import { RendererSystem, initRendererSystem } from "./systems/RendererSystem";
import { RotateSystem } from "./systems/RotateSystem";

const world = createWorld();

registerComponents(world, [
  RendererComponent,
  Object3DComponent,
  RotateComponent,
]);

const sceneEid = addEntity(world);
const scene = new Scene();
addObject3DComponent(world, sceneEid, scene);

const cameraEid = addEntity(world);
const camera = new PerspectiveCamera();
camera.position.z = 5;
addObject3DComponent(world, cameraEid, camera);

const canvas = document.getElementById("canvas");
const rendererEid = addEntity(world);
const renderer = new WebGLRenderer({ canvas, antialias: true });
addRendererComponent(world, rendererEid, renderer, scene, camera);
initRendererSystem(world);

const cubeEid = addEntity(world);
const cube = new Mesh(new BoxBufferGeometry(), new MeshBasicMaterial());
addRotateComponent(world, cubeEid, new Vector3(0.5, 1, 0).normalize(), 1);
addObject3DComponent(world, cubeEid, cube);
scene.add(cube);

const pipeline = pipe([RotateSystem, RendererSystem]);

const clock = new Clock();

renderer.setAnimationLoop(() => {
  world.dt = clock.getDelta();
  pipeline(world);
});
