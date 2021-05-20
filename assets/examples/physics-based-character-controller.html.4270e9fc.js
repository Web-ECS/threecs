import "../styles.16b1c26f.js";
import {V as Vector3, O as Object3D, T as TextureLoader, M as Mesh, B as BoxGeometry, a as MeshBasicMaterial, n as SphereGeometry} from "../vendor.1b858d03.js";
import {l as loadRapierPhysicsSystem, c as createThreeWorld, F as FirstPersonCameraSystem, P as PhysicsCharacterControllerSystem, j as FirstPersonCameraActions, A as ActionType, B as BindingType, k as PhysicsCharacterControllerActions, g as addMapComponent, m as PhysicsWorldComponent, f as addObject3DEntity, n as PhysicsCharacterControllerComponent, h as addComponent, o as PhysicsBodyStatus, p as PhysicsColliderShape, q as PhysicsRigidBodyComponent, e as crateTextureUrl, s as FirstPersonCameraYawTarget, t as FirstPersonCameraPitchTarget} from "../crate.fdc80e8c.js";
async function main() {
  const PhysicsSystem = await loadRapierPhysicsSystem();
  const {world, scene, sceneEid, camera, cameraEid, start} = createThreeWorld({
    pointerLock: true,
    systems: [
      FirstPersonCameraSystem,
      PhysicsCharacterControllerSystem,
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
            path: PhysicsCharacterControllerActions.Move,
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
          },
          {
            id: "jump",
            path: PhysicsCharacterControllerActions.Jump,
            type: ActionType.Button,
            bindings: [
              {
                type: BindingType.Button,
                path: "Keyboard/Space"
              }
            ]
          }
        ]
      }
    ]
  });
  addMapComponent(world, PhysicsWorldComponent, sceneEid, {
    gravity: new Vector3(0, -6, 0)
  });
  const playerRig = new Object3D();
  const playerRigEid = addObject3DEntity(world, playerRig, scene);
  addMapComponent(world, PhysicsCharacterControllerComponent, playerRigEid, {
    speed: 1.5
  });
  addComponent(world, FirstPersonCameraYawTarget, playerRigEid);
  playerRig.add(camera);
  addComponent(world, FirstPersonCameraPitchTarget, cameraEid);
  addMapComponent(world, PhysicsRigidBodyComponent, playerRigEid, {
    bodyStatus: PhysicsBodyStatus.Kinematic,
    shape: PhysicsColliderShape.Capsule,
    halfHeight: 0.8,
    radius: 0.5,
    translation: new Vector3(0, 0.8, 0)
  });
  playerRig.position.z = 5;
  playerRig.position.y = 0.5;
  camera.position.y = 1.6;
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const cube = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({map: crateTexture}));
  const cubeEid = addObject3DEntity(world, cube, scene);
  cube.position.y = 2;
  cube.rotation.x = 0.35;
  cube.rotation.z = 0.25;
  addMapComponent(world, PhysicsRigidBodyComponent, cubeEid, {
    bodyStatus: PhysicsBodyStatus.Dynamic
  });
  const sphere = new Mesh(new SphereGeometry(1, 10, 10), new MeshBasicMaterial({color: 16711680}));
  const sphereEid = addObject3DEntity(world, sphere, scene);
  sphere.position.y = 0.25;
  sphere.position.z = -0.5;
  addMapComponent(world, PhysicsRigidBodyComponent, sphereEid, {
    bodyStatus: PhysicsBodyStatus.Static
  });
  const ground = new Mesh(new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
  const groundEid = addObject3DEntity(world, ground, scene);
  addMapComponent(world, PhysicsRigidBodyComponent, groundEid, {
    bodyStatus: PhysicsBodyStatus.Static
  });
  start();
}
main().catch(console.error);
