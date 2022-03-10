import { c as createThreeWorld, O as Object3DComponent, M as MeshEntity, E as BoxGeometryEntity, G as MeshBasicMaterialEntity } from "../AudioSystem.49d2e024.js";
/* empty css                  */import { d as defineComponent, a as defineQuery, T as TextureLoader, b as addComponent, c as Types } from "../vendor.95af2766.js";
import { u as updateQuaternion } from "../utils.918e2dc7.js";
import { c as crateTextureUrl } from "../crate.9cc70004.js";
const RotateComponent = defineComponent({
  axis: [Types.f32, 3],
  speed: Types.f32
});
const rotateQuery = defineQuery([RotateComponent, Object3DComponent]);
const setVec3 = (v1, v2) => {
  v1[0] = v2[0];
  v1[1] = v2[1];
  v1[2] = v2[2];
};
const addVec3 = (v1, v2) => {
  v1[0] += v2[0];
  v1[1] += v2[1];
  v1[2] += v2[2];
};
const scaleVec3 = (v, s) => {
  v[0] *= s;
  v[1] *= s;
  v[2] *= s;
};
const rotV3 = new Float32Array(3);
const RotateSystem = (world2) => {
  const entities = rotateQuery(world2);
  entities.forEach((eid) => {
    const { dt } = world2;
    const rotation = Object3DComponent.rotation[eid];
    const axis = RotateComponent.axis[eid];
    const speed = RotateComponent.speed[eid];
    setVec3(rotV3, axis);
    scaleVec3(rotV3, speed * dt);
    addVec3(rotation, rotV3);
    updateQuaternion(eid);
  });
  return world2;
};
const { world, start } = createThreeWorld({
  systems: [RotateSystem]
});
const { scene, camera } = world;
const cameraPosition = Object3DComponent.position[camera.eid];
setVec3(cameraPosition, [0, 0, 5]);
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new MeshEntity(world, new BoxGeometryEntity(world), new MeshBasicMaterialEntity(world, { map: crateTexture }));
scene.add(cube);
addComponent(world, RotateComponent, cube.eid);
RotateComponent.axis[cube.eid].set([0.5, 1, 0]);
RotateComponent.speed[cube.eid] = 1;
start();
