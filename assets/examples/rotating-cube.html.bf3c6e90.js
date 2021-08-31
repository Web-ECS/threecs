import "../styles.9cab3664.js";
import {T as TextureLoader, M as Mesh, B as BoxGeometry, a as MeshBasicMaterial, V as Vector3} from "../vendor.6c76840a.js";
import {d as defineMapComponent, a as defineSystem, c as createThreeWorld, e as addObject3DEntity, f as addMapComponent, O as Object3DComponent, h as defineQuery} from "../AudioSystem.3f2ec82b.js";
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
const {world, scene, camera, start} = createThreeWorld({
  systems: [RotateSystem]
});
camera.position.z = 5;
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
const cubeEid = addObject3DEntity(world, cube, scene);
addMapComponent(world, RotateComponent, cubeEid, {
  axis: new Vector3(0.5, 1, 0).normalize(),
  speed: 1
});
start();
