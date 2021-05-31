import "../styles.16b1c26f.js";
import {n as TextureLoader, l as Mesh, B as BoxGeometry, o as MeshBasicMaterial, j as Vector3} from "../vendor.9d3ec889.js";
import {t as defineMapComponent, a as defineSystem, c as createThreeWorld, j as addObject3DEntity, u as addMapComponent, O as Object3DComponent, p as defineQuery} from "../AnimationSystem.fc8c672d.js";
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
