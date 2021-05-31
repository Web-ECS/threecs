import "../styles.9cab3664.js";
import {T as TextureLoader, M as Mesh, B as BoxGeometry, a as MeshBasicMaterial, V as Vector3} from "../vendor.514f9e0b.js";
import {d as defineMapComponent, a as defineSystem, b as defineComponent, c as createThreeWorld, e as addObject3DEntity, f as addMapComponent, g as addComponent, O as Object3DComponent, r as removeObject3DEntity, h as defineQuery, T as Types} from "../AnimationSystem.d20b3d79.js";
import {c as crateTextureUrl} from "../crate.9cc70004.js";
const RotateComponent = defineMapComponent();
const rotateQuery = defineQuery([RotateComponent, Object3DComponent]);
const RotateSystem = defineSystem((world2) => {
  const entities = rotateQuery(world2);
  entities.forEach((eid) => {
    const dt = world2.dt;
    const object3D = Object3DComponent.storage.get(eid);
    const {speed, axis} = RotateComponent.storage.get(eid);
    object3D.rotateOnAxis(axis, speed * dt);
  });
});
const DeferredRemovalComponent = defineComponent({
  removeAfter: Types.f32
});
const deferredRemovalQuery = defineQuery([
  DeferredRemovalComponent,
  Object3DComponent
]);
const DeferredRemovalSystem = defineSystem((world2) => {
  const entities = deferredRemovalQuery(world2);
  entities.forEach((eid) => {
    const removeAfter = DeferredRemovalComponent.removeAfter[eid];
    if (world2.time > removeAfter) {
      removeObject3DEntity(world2, eid);
    }
  });
});
const {world, scene, camera, start} = createThreeWorld({
  systems: [DeferredRemovalSystem, RotateSystem]
});
camera.position.z = 5;
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
const cubeEid = addObject3DEntity(world, cube, scene);
addMapComponent(world, RotateComponent, cubeEid, {
  axis: new Vector3(0.5, 1, 0).normalize(),
  speed: 1
});
addComponent(world, DeferredRemovalComponent, cubeEid);
DeferredRemovalComponent.removeAfter[cubeEid] = 1;
const cube2 = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
const cube2Eid = addObject3DEntity(world, cube2, cube);
addMapComponent(world, RotateComponent, cube2Eid, {
  axis: new Vector3(0.5, 1, 0).normalize(),
  speed: 1
});
cube2.position.x = 1;
start();
