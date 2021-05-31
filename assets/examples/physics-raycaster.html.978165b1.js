import "../styles.16b1c26f.js";
import {O as Object3D, T as TextureLoader, M as Mesh, B as BoxGeometry, a as MeshBasicMaterial, q as SphereGeometry} from "../vendor.2af62ae5.js";
import {l as loadPhysicsSystem, c as createThreeWorld, F as FirstPersonCameraSystem, D as DirectionalMovementSystem, j as FirstPersonCameraActions, k as ActionType, B as BindingType, z as DirectionalMovementActions, m as addPhysicsWorldComponent, e as addObject3DEntity, g as addComponent, C as addPhysicsRaycasterComponent, p as addRigidBodyComponent, w as PhysicsBodyStatus, u as FirstPersonCameraYawTarget, v as FirstPersonCameraPitchTarget, E as DirectionalMovementComponent} from "../AnimationSystem.82b0b2be.js";
import {c as crateTextureUrl} from "../crate.9cc70004.js";
async function main() {
  const PhysicsSystem = await loadPhysicsSystem();
  const {world, scene, sceneEid, camera, cameraEid, start} = createThreeWorld({
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
  addPhysicsWorldComponent(world, sceneEid);
  const playerRig = new Object3D();
  const playerRigEid = addObject3DEntity(world, playerRig, scene);
  addComponent(world, FirstPersonCameraYawTarget, playerRigEid);
  playerRig.add(camera);
  addComponent(world, FirstPersonCameraPitchTarget, cameraEid);
  addComponent(world, DirectionalMovementComponent, playerRigEid);
  addPhysicsRaycasterComponent(world, cameraEid, {
    withIntersection: true,
    debug: true
  });
  playerRig.position.set(0, 0.5, 5);
  camera.position.set(0, 1.6, 0);
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const cube = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({map: crateTexture}));
  const cubeEid = addObject3DEntity(world, cube, scene);
  cube.position.set(0.35, 2, 0.25);
  addRigidBodyComponent(world, cubeEid, {
    bodyStatus: PhysicsBodyStatus.Dynamic
  });
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