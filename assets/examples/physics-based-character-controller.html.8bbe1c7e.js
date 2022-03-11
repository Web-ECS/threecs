import { l as loadPhysicsSystem, a as singletonQuery, O as Object3DComponent, c as createThreeWorld, F as FirstPersonCameraSystem, P as PhysicsCharacterControllerSystem, b as FirstPersonCameraActions, d as ActionType, B as BindingType, e as PhysicsCharacterControllerActions, f as addPhysicsWorldComponent, g as addPhysicsCharacterControllerEntity, h as FirstPersonCameraYawTarget, i as FirstPersonCameraPitchTarget, M as MeshEntity, p as addRigidBodyComponent, R as RigidBodyType } from "../AnimationSystem.1fc34b0b.js";
/* empty css                  */import { d as defineComponent, a as defineQuery, b as addComponent, T as TextureLoader, B as BoxGeometry, M as MeshBasicMaterial, x as SphereGeometry, aJ as RepeatWrapping } from "../vendor.95af2766.js";
import { c as crateTextureUrl } from "../crate.9cc70004.js";
var physicsBasedCharacterController_html_htmlProxy_index_0 = "";
var grassTextureUrl = "/threecs/assets/grass.e6dfe2a4.png";
async function main() {
  const PhysicsSystem = await loadPhysicsSystem();
  const CrouchMeshTarget = defineComponent({});
  const CrouchCameraTarget = defineComponent({});
  const crouchMeshQuery = singletonQuery(defineQuery([CrouchMeshTarget, Object3DComponent]));
  const crouchCameraQuery = singletonQuery(defineQuery([CrouchCameraTarget, Object3DComponent]));
  const CrouchSystem = function CrouchSystem2(world2) {
    const crouchMeshEid = crouchMeshQuery(world2);
    const crouchCameraEid = crouchCameraQuery(world2);
    if (crouchMeshEid === void 0 || crouchCameraEid === void 0) {
      return;
    }
    const crouch = world2.actions.get(PhysicsCharacterControllerActions.Crouch);
    const mesh = Object3DComponent.store.get(crouchMeshEid);
    const camera2 = Object3DComponent.store.get(crouchCameraEid);
    if (crouch.pressed && crouch.held) {
      mesh.scale.set(1, 0.5, 1);
      camera2.scale.set(1, 2, 1);
      camera2.position.y = 0.8;
    } else if (crouch.released && !crouch.held) {
      mesh.scale.set(1, 1, 1);
      camera2.scale.set(1, 1, 1);
      camera2.position.y = 1.6;
    }
    return world2;
  };
  const { world, start } = createThreeWorld({
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
  const { scene, camera } = world;
  addPhysicsWorldComponent(world, scene.eid);
  const playerRig = addPhysicsCharacterControllerEntity(world);
  scene.add(playerRig);
  addComponent(world, FirstPersonCameraYawTarget, playerRig.eid);
  addComponent(world, CrouchMeshTarget, playerRig.eid);
  addComponent(world, FirstPersonCameraPitchTarget, camera.eid);
  addComponent(world, CrouchCameraTarget, camera.eid);
  playerRig.add(camera);
  playerRig.position.set(0, 0.1, 5);
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
  const wall = new MeshEntity(world, new BoxGeometry(2, 3, 0.5), new MeshBasicMaterial({ color: 65280 }));
  wall.position.set(-3, 1.5, -1);
  wall.rotation.set(0, Math.PI / 4, 0);
  addRigidBodyComponent(world, wall.eid);
  const grassTexture = new TextureLoader().load(grassTextureUrl);
  grassTexture.wrapS = grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(10, 10);
  const ground = new MeshEntity(world, new BoxGeometry(100, 0.1, 100), new MeshBasicMaterial({ map: grassTexture }), scene.eid);
  addRigidBodyComponent(world, ground.eid);
  scene.add(cube);
  scene.add(sphere);
  scene.add(wall);
  scene.add(ground);
  start();
}
main().catch(console.error);
