import { c as createThreeWorld, M as MeshEntity, O as Object3DComponent, s as setParentEntity, r as removeObject3DEntity } from "../AnimationSystem.b21a5b05.js";
/* empty css                  */import { d as defineComponent, a as defineQuery, T as TextureLoader, B as BoxGeometry, M as MeshBasicMaterial, b as addComponent, c as Types, e as defineSystem } from "../vendor.c084ab64.js";
import { u as updateQuaternion } from "../utils.1beddbf6.js";
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
const RotateSystem = defineSystem((world2) => {
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
});
const DeferredRemovalComponent = defineComponent({
  removeAfter: Types.f32
});
const deferredRemovalQuery = defineQuery([
  DeferredRemovalComponent,
  Object3DComponent
]);
const DeferredRemovalSystem = (world2) => {
  const entities = deferredRemovalQuery(world2);
  entities.forEach((eid) => {
    const removeAfter = DeferredRemovalComponent.removeAfter[eid];
    if (world2.time > removeAfter) {
      removeObject3DEntity(world2, eid);
    }
  });
  return world2;
};
const { world, start } = createThreeWorld({
  systems: [DeferredRemovalSystem, RotateSystem]
});
const { camera, scene } = world;
camera.position.z = 5;
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new MeshEntity(world, new BoxGeometry(), new MeshBasicMaterial({ map: crateTexture }));
addComponent(world, RotateComponent, cube.eid);
RotateComponent.axis[cube.eid].set([0.5, 1, 0]);
RotateComponent.speed[cube.eid] = 1;
addComponent(world, DeferredRemovalComponent, cube.eid);
DeferredRemovalComponent.removeAfter[cube.eid] = 3;
const cube2 = new MeshEntity(world, new BoxGeometry(), new MeshBasicMaterial({ map: crateTexture }));
addComponent(world, RotateComponent, cube2.eid);
RotateComponent.axis[cube2.eid].set([0.5, 1, 0]);
RotateComponent.speed[cube2.eid] = 1;
Object3DComponent.position[cube2.eid][0] = 1;
setParentEntity(cube.eid, world.scene.eid);
setParentEntity(cube2.eid, cube.eid);
start();
