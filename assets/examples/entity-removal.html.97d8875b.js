import "../dynamic-import-polyfill.b9526b8c.js";
import {d as defineComponent, a as defineSystem, r as registerComponents, S as Scene, P as PerspectiveCamera, b as addEntity, W as WebGLRenderer, T as TextureLoader, M as Mesh, B as BoxGeometry, c as MeshBasicMaterial, V as Vector3, e as addComponent, f as Types, g as createWorld, C as Clock, p as pipe, h as defineQuery} from "../vendor.ad59a495.js";
import {i as initObject3DStorage, a as addObject3DEntity, b as addRendererComponent, c as initRendererSystem, d as crateTextureUrl, O as Object3DComponent, r as removeObject3DEntity, R as RendererComponent, e as RendererSystem} from "../crate.c62bfbe3.js";
const RotateComponent = defineComponent(new Map());
function addRotateComponent(world2, eid, axis, speed) {
  addComponent(world2, RotateComponent, eid);
  RotateComponent.set(eid, {axis, speed});
}
const rotateQuery = defineQuery([RotateComponent, Object3DComponent]);
const RotateSystem = defineSystem((world2) => {
  const entities = rotateQuery(world2);
  entities.forEach((eid) => {
    const dt = world2.dt;
    const object3D = Object3DComponent.get(eid);
    const {speed, axis} = RotateComponent.get(eid);
    object3D.rotateOnAxis(axis, speed * dt);
  });
});
const DeferredRemovalComponent = defineComponent({
  removeAfter: Types.f32
});
const deferredRemovalQuery = defineQuery([DeferredRemovalComponent, Object3DComponent]);
const DeferredRemovalSystem = defineSystem((world2) => {
  const entities = deferredRemovalQuery(world2);
  entities.forEach((eid) => {
    const removeAfter = DeferredRemovalComponent.removeAfter[eid];
    if (world2.time > removeAfter) {
      removeObject3DEntity(world2, eid);
    }
  });
});
const world = createWorld();
initObject3DStorage(world);
registerComponents(world, [
  RendererComponent,
  Object3DComponent,
  RotateComponent,
  DeferredRemovalComponent
]);
const scene = new Scene();
addObject3DEntity(world, scene);
const camera = new PerspectiveCamera();
camera.position.z = 5;
addObject3DEntity(world, camera, scene);
document.getElementById("canvas");
const rendererEid = addEntity(world);
const renderer = new WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
addRendererComponent(world, rendererEid, renderer, scene, camera);
initRendererSystem(world);
const clock = new Clock();
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
const cubeEid = addObject3DEntity(world, cube, scene);
addRotateComponent(world, cubeEid, new Vector3(0.5, 1, 0).normalize(), 1);
addComponent(world, DeferredRemovalComponent, cubeEid);
DeferredRemovalComponent.removeAfter[cubeEid] = clock.getElapsedTime() + 1;
const cube2 = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
const cube2Eid = addObject3DEntity(world, cube2, cube);
addRotateComponent(world, cube2Eid, new Vector3(0.5, 1, 0).normalize(), 1);
cube2.position.x = 1;
const pipeline = pipe([RotateSystem, DeferredRemovalSystem, RendererSystem]);
renderer.setAnimationLoop(() => {
  world.dt = clock.getDelta();
  world.time = clock.getElapsedTime();
  pipeline(world);
});
