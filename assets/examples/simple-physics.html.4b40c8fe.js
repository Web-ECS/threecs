import "../styles.16b1c26f.js";
import {V as Vector3, T as TextureLoader, M as Mesh, B as BoxGeometry, a as MeshBasicMaterial, n as SphereGeometry, w as wasmUrl} from "../vendor.0520bc5a.js";
import {j as loadAmmoPhysicsSystem, c as createThreeWorld, g as addMapComponent, P as PhysicsWorldComponent, e as crateTextureUrl, f as addObject3DEntity, m as PhysicsRigidBodyComponent} from "../crate.7e0f87d8.js";
async function main() {
  const PhysicsSystem = await loadAmmoPhysicsSystem({wasmUrl});
  const {world, scene, sceneEid, camera, start} = createThreeWorld({
    systems: [PhysicsSystem]
  });
  addMapComponent(world, PhysicsWorldComponent, sceneEid, {
    gravity: new Vector3(0, -6, 0)
  });
  camera.position.z = 5;
  camera.position.y = 3;
  camera.lookAt(0, 0, 0);
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const cube = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({map: crateTexture}));
  const cubeEid = addObject3DEntity(world, cube, scene);
  cube.position.y = 2;
  cube.rotation.x = 0.35;
  cube.rotation.z = 0.25;
  addMapComponent(world, PhysicsRigidBodyComponent, cubeEid, {
    mass: 1
  });
  const sphere = new Mesh(new SphereGeometry(1, 10, 10), new MeshBasicMaterial({color: 16711680}));
  const sphereEid = addObject3DEntity(world, sphere, scene);
  sphere.position.y = 0.25;
  sphere.position.z = -0.5;
  addMapComponent(world, PhysicsRigidBodyComponent, sphereEid, {
    mass: 0
  });
  const ground = new Mesh(new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
  const groundEid = addObject3DEntity(world, ground, scene);
  addMapComponent(world, PhysicsRigidBodyComponent, groundEid, {
    mass: 0
  });
  start();
}
main().catch(console.error);
