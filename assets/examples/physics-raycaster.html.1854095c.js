import { l as loadPhysicsSystem, c as createThreeWorld, F as FirstPersonCameraSystem, D as DirectionalMovementSystem, b as FirstPersonCameraActions, d as ActionType, B as BindingType, x as DirectionalMovementActions, f as addPhysicsWorldComponent, y as Object3DEntity, h as FirstPersonCameraYawTarget, v as setChildEntity, i as FirstPersonCameraPitchTarget, z as DirectionalMovementComponent, C as addPhysicsRaycasterComponent, M as MeshEntity, p as addRigidBodyComponent, R as RigidBodyType } from "../AnimationSystem.b21a5b05.js";
/* empty css                  */import { b as addComponent, T as TextureLoader, B as BoxGeometry, M as MeshBasicMaterial, x as SphereGeometry } from "../vendor.c084ab64.js";
import { c as crateTextureUrl } from "../crate.9cc70004.js";
async function main() {
  const PhysicsSystem = await loadPhysicsSystem();
  const { world, start } = createThreeWorld({
    pointerLock: true,
    systems: [
      FirstPersonCameraSystem,
      DirectionalMovementSystem,
      PhysicsSystem
    ],
    actionMaps: [
      {
        id: "movement",
        actions: [
          {
            id: "look",
            path: FirstPersonCameraActions.Look,
            type: ActionType.Vector2,
            bindings: [
              {
                type: BindingType.Axes,
                x: "Mouse/movementX",
                y: "Mouse/movementY"
              }
            ]
          },
          {
            id: "move",
            path: DirectionalMovementActions.Move,
            type: ActionType.Vector2,
            bindings: [
              {
                type: BindingType.DirectionalButtons,
                up: "Keyboard/KeyW",
                down: "Keyboard/KeyS",
                left: "Keyboard/KeyA",
                right: "Keyboard/KeyD"
              }
            ]
          }
        ]
      }
    ]
  });
  const { scene, camera } = world;
  addPhysicsWorldComponent(world, scene.eid);
  const playerRig = new Object3DEntity(world, scene.eid);
  addComponent(world, FirstPersonCameraYawTarget, playerRig.eid);
  setChildEntity(playerRig.eid, camera.eid);
  addComponent(world, FirstPersonCameraPitchTarget, camera.eid);
  addComponent(world, DirectionalMovementComponent, playerRig.eid);
  addPhysicsRaycasterComponent(world, camera.eid, {
    withIntersection: true,
    debug: true
  });
  playerRig.position.set(0, 0.5, 5);
  camera.position.set(0, 1.6, 0);
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const cube = new MeshEntity(world, new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ map: crateTexture }));
  cube.position.set(0.35, 2, 0.25);
  addRigidBodyComponent(world, cube.eid, {
    bodyType: RigidBodyType.Dynamic
  });
  const sphere = new MeshEntity(world, new SphereGeometry(1, 10, 10), new MeshBasicMaterial({ color: 16711680 }));
  sphere.position.set(0, 0.25, -0.5);
  addRigidBodyComponent(world, sphere.eid);
  const ground = new MeshEntity(world, new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
  addRigidBodyComponent(world, ground.eid);
  scene.add(cube);
  scene.add(sphere);
  scene.add(ground);
  start();
}
main().catch(console.error);
