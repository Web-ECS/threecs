import { l as loadPhysicsSystem, c as createThreeWorld, n as addPhysicsWorldComponent, e as addObject3DEntity, w as addRigidBodyComponent, R as RigidBodyType } from "../AudioSystem.d48bdf87.js";
/* empty css                  */import { T as TextureLoader, M as Mesh, B as BoxGeometry, a as MeshBasicMaterial, E as SphereGeometry } from "../vendor.b601bcc0.js";
import { c as crateTextureUrl } from "../crate.9cc70004.js";
async function main() {
  const PhysicsSystem = await loadPhysicsSystem();
  const { world, scene, sceneEid, camera, start } = createThreeWorld({
    systems: [PhysicsSystem]
  });
  addPhysicsWorldComponent(world, sceneEid);
  camera.position.set(0, 3, 5);
  camera.lookAt(0, 0, 0);
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const cube = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({ map: crateTexture }));
  const cubeEid = addObject3DEntity(world, cube, scene);
  cube.position.set(0.35, 2, 0.25);
  addRigidBodyComponent(world, cubeEid, {
    bodyType: RigidBodyType.Dynamic
  });
  const sphere = new Mesh(new SphereGeometry(1, 10, 10), new MeshBasicMaterial({ color: 16711680 }));
  const sphereEid = addObject3DEntity(world, sphere, scene);
  sphere.position.set(0, 0.25, -0.5);
  addRigidBodyComponent(world, sphereEid);
  const ground = new Mesh(new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
  const groundEid = addObject3DEntity(world, ground, scene);
  addRigidBodyComponent(world, groundEid);
  start();
}
main().catch(console.error);
