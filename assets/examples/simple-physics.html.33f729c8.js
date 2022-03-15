import { l as loadPhysicsSystem, c as createThreeWorld, f as addPhysicsWorldComponent, M as MeshEntity, O as Object3DComponent, p as addRigidBodyComponent, R as RigidBodyType, v as setChildEntity } from "../AnimationSystem.b21a5b05.js";
/* empty css                  */import { T as TextureLoader, B as BoxGeometry, M as MeshBasicMaterial, x as SphereGeometry } from "../vendor.c084ab64.js";
import { c as crateTextureUrl } from "../crate.9cc70004.js";
const setVec3 = (v1, v2) => {
  v1[0] = v2[0];
  v1[1] = v2[1];
  v1[2] = v2[2];
};
async function main() {
  const PhysicsSystem = await loadPhysicsSystem();
  const { world, start } = createThreeWorld({
    systems: [PhysicsSystem]
  });
  const { scene, camera } = world;
  addPhysicsWorldComponent(world, scene.eid);
  camera.position.set(0, 3, 5);
  camera.lookAt(0, 0, 0);
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const cube = new MeshEntity(world, new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({ map: crateTexture }));
  const cubePosition = Object3DComponent.position[cube.eid];
  setVec3(cubePosition, [0.35, 2, 0.25]);
  addRigidBodyComponent(world, cube.eid, {
    bodyType: RigidBodyType.Dynamic
  });
  const sphere = new MeshEntity(world, new SphereGeometry(1, 10, 10), new MeshBasicMaterial({ color: 16711680 }));
  const spherePosition = Object3DComponent.position[sphere.eid];
  setVec3(spherePosition, [0, 0.25, -0.5]);
  addRigidBodyComponent(world, sphere.eid);
  const ground = new MeshEntity(world, new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
  addRigidBodyComponent(world, ground.eid);
  setChildEntity(scene.eid, cube.eid);
  setChildEntity(scene.eid, sphere.eid);
  setChildEntity(scene.eid, ground.eid);
  start();
}
main().catch(console.error);
