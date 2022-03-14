import { l as loadPhysicsSystem, c as createThreeWorld, I as InstancedMeshImposterSystem, f as addPhysicsWorldComponent, u as InstancedMeshEntity, v as setChildEntity, w as InstancedMeshImposterEntity, p as addRigidBodyComponent, R as RigidBodyType, M as MeshEntity } from "../AnimationSystem.00f7d807.js";
/* empty css                  */import { T as TextureLoader, B as BoxGeometry, M as MeshBasicMaterial, x as SphereGeometry } from "../vendor.c084ab64.js";
import { c as crateTextureUrl } from "../crate.9cc70004.js";
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
  const n = 2500;
  const { world, start } = createThreeWorld({
    systems: [benchmark(PhysicsSystem), InstancedMeshImposterSystem]
  });
  const { camera, scene } = world;
  addPhysicsWorldComponent(world, scene.eid);
  camera.position.set(0, 3, 5);
  camera.lookAt(0, 0, 0);
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const instancedMesh = new InstancedMeshEntity(world, new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({ map: crateTexture }), n);
  setChildEntity(scene.eid, instancedMesh.eid);
  for (let i = 0; i < n; i++) {
    const cube = new InstancedMeshImposterEntity(world, instancedMesh);
    cube.position.y = Math.floor(i / 10) + 2;
    cube.position.x = i % 10 - 5;
    cube.rotation.set(0.35, 0, 0.25);
    addRigidBodyComponent(world, cube.eid, {
      bodyType: RigidBodyType.Dynamic
    });
  }
  const sphere = new MeshEntity(world, new SphereGeometry(1, 10, 10), new MeshBasicMaterial({ color: 16711680 }));
  setChildEntity(scene.eid, sphere.eid);
  sphere.position.set(0, 0.25, -0.5);
  addRigidBodyComponent(world, sphere.eid);
  const ground = new MeshEntity(world, new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
  addRigidBodyComponent(world, ground.eid);
  setChildEntity(scene.eid, sphere.eid);
  setChildEntity(scene.eid, ground.eid);
  window.scene = scene;
  start();
}
main().catch(console.error);
