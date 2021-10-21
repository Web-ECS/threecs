import { l as loadPhysicsSystem, b as defineComponent, s as singletonQuery, a as defineQuery, c as createThreeWorld, F as FirstPersonCameraSystem, P as PhysicsCharacterControllerSystem, j as FirstPersonCameraActions, k as ActionType, B as BindingType, m as PhysicsCharacterControllerActions, n as addPhysicsWorldComponent, o as addPhysicsCharacterControllerEntity, g as addComponent, e as addObject3DEntity, w as addRigidBodyComponent, R as RigidBodyType, O as Object3DComponent, h as defineSystem, p as FirstPersonCameraYawTarget, q as FirstPersonCameraPitchTarget } from "../AudioSystem.d48bdf87.js";
/* empty css                  */import { T as TextureLoader, M as Mesh, B as BoxGeometry, a as MeshBasicMaterial, E as SphereGeometry, R as RepeatWrapping } from "../vendor.b601bcc0.js";
import { c as crateTextureUrl } from "../crate.9cc70004.js";
var grassTextureUrl = "/threecs/assets/grass.e6dfe2a4.png";
async function main() {
  const PhysicsSystem = await loadPhysicsSystem();
  const CrouchMeshTarget = defineComponent({});
  const CrouchCameraTarget = defineComponent({});
  const crouchMeshQuery = singletonQuery(defineQuery([CrouchMeshTarget, Object3DComponent]));
  const crouchCameraQuery = singletonQuery(defineQuery([CrouchCameraTarget, Object3DComponent]));
  const CrouchSystem = defineSystem(function CrouchSystem2(world2) {
    const crouchMeshEid = crouchMeshQuery(world2);
    const crouchCameraEid = crouchCameraQuery(world2);
    if (crouchMeshEid === void 0 || crouchCameraEid === void 0) {
      return;
    }
    const crouch = world2.actions.get(PhysicsCharacterControllerActions.Crouch);
    const mesh = Object3DComponent.storage.get(crouchMeshEid);
    const camera2 = Object3DComponent.storage.get(crouchCameraEid);
    if (crouch.pressed && crouch.held) {
      mesh.scale.set(1, 0.5, 1);
      camera2.scale.set(1, 2, 1);
      camera2.position.y = 0.8;
    } else if (crouch.released && !crouch.held) {
      mesh.scale.set(1, 1, 1);
      camera2.scale.set(1, 1, 1);
      camera2.position.y = 1.6;
    }
  });
  const { world, scene, sceneEid, camera, cameraEid, start } = createThreeWorld({
    pointerLock: true,
    systems: [
      FirstPersonCameraSystem,
      PhysicsCharacterControllerSystem,
      CrouchSystem,
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
          },
          {
            id: "crouch",
            path: PhysicsCharacterControllerActions.Crouch,
            type: ActionType.Button,
            bindings: [
              {
                type: BindingType.Button,
                path: "Keyboard/KeyC"
              }
            ]
          },
          {
            id: "sprint",
            path: PhysicsCharacterControllerActions.Sprint,
            type: ActionType.Button,
            bindings: [
              {
                type: BindingType.Button,
                path: "Keyboard/ShiftLeft"
              }
            ]
          }
        ]
      }
    ]
  });
  addPhysicsWorldComponent(world, sceneEid);
  const [playerRigEid, playerRig] = addPhysicsCharacterControllerEntity(world, scene);
  addComponent(world, FirstPersonCameraYawTarget, playerRigEid);
  addComponent(world, CrouchMeshTarget, playerRigEid);
  addComponent(world, FirstPersonCameraPitchTarget, cameraEid);
  addComponent(world, CrouchCameraTarget, cameraEid);
  playerRig.add(camera);
  playerRig.position.set(0, 0.1, 5);
  camera.position.set(0, 1.6, 0);
  const crateTexture = new TextureLoader().load(crateTextureUrl);
  const cube = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ map: crateTexture }));
  const cubeEid = addObject3DEntity(world, cube, scene);
  cube.position.set(0.35, 2, 0.25);
  addRigidBodyComponent(world, cubeEid, {
    bodyType: RigidBodyType.Dynamic
  });
  const sphere = new Mesh(new SphereGeometry(1, 10, 10), new MeshBasicMaterial({ color: 16711680 }));
  const sphereEid = addObject3DEntity(world, sphere, scene);
  sphere.position.set(0, 0.25, -0.5);
  addRigidBodyComponent(world, sphereEid);
  const wall = new Mesh(new BoxGeometry(2, 3, 0.5), new MeshBasicMaterial({ color: 65280 }));
  const wallEid = addObject3DEntity(world, wall, scene);
  wall.position.set(-3, 1.5, -1);
  wall.rotation.set(0, Math.PI / 4, 0);
  addRigidBodyComponent(world, wallEid);
  const grassTexture = new TextureLoader().load(grassTextureUrl);
  grassTexture.wrapS = grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(10, 10);
  const ground = new Mesh(new BoxGeometry(100, 0.1, 100), new MeshBasicMaterial({ map: grassTexture }));
  const groundEid = addObject3DEntity(world, ground, scene);
  addRigidBodyComponent(world, groundEid);
  start();
}
main().catch(console.error);
