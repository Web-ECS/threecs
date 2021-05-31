import "../styles.9cab3664.js";
import {T as TextureLoader, a as MeshBasicMaterial, B as BoxGeometry, M as Mesh, v as SphereGeometry} from "../vendor.706402a0.js";
import {l as loadPhysicsSystem, c as createThreeWorld, I as InstancedMeshRendererSystem, n as addPhysicsWorldComponent, C as addInstancedMeshRendererEntity, D as addInstancedMeshImposterEntity, w as addRigidBodyComponent, z as PhysicsBodyStatus, e as addObject3DEntity} from "../AudioSystem.a9f32935.js";
import {c as crateTextureUrl} from "../crate.9cc70004.js";
function benchmark(system, count = 500) {
  const times = [];
  let finished = false;
  return function benchmarkedSystem(world) {
    const start = performance.now();
    system(world);
    const finish = performance.now();
    if (times.length < count) {
      times.push(finish - start);
    } else if (times.length === count && !finished) {
      finished = true;
      let total = 0;
      for (let i = 0; i < count; i++) {
        total += times[i];
      }
      times.sort((a, b) => a - b);
      console.log({
        name: system.name,
        total,
        mean: total / count,
        median: times[Math.floor(count / 2)]
      });
    }
    return world;
  };
}
async function main() {
  const PhysicsSystem = await loadPhysicsSystem();
  const {world, scene, sceneEid, camera, start} = createThreeWorld({
    systems: [benchmark(PhysicsSystem), InstancedMeshRendererSystem]
  });
  addPhysicsWorldComponent(world, sceneEid);
  camera.position.set(0, 3, 5);
  camera.lookAt(0, 0, 0);
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const [_, instancedMeshRenderer] = addInstancedMeshRendererEntity(world, new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({map: crateTexture}), 2500, scene);
  for (let i = 0; i < 2500; i++) {
    const [cubeEid, cube] = addInstancedMeshImposterEntity(world, instancedMeshRenderer, scene);
    cube.position.y = Math.floor(i / 10) + 2;
    cube.position.x = i % 10 - 5;
    cube.rotation.set(0.35, 0, 0.25);
    addRigidBodyComponent(world, cubeEid, {
      bodyStatus: PhysicsBodyStatus.Dynamic
    });
  }
  const sphere = new Mesh(new SphereGeometry(1, 10, 10), new MeshBasicMaterial({color: 16711680}));
  const sphereEid = addObject3DEntity(world, sphere, scene);
  sphere.position.set(0, 0.25, -0.5);
  addRigidBodyComponent(world, sphereEid);
  const ground = new Mesh(new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
  const groundEid = addObject3DEntity(world, ground, scene);
  addRigidBodyComponent(world, groundEid);
  start();
}
main().catch(console.error);
