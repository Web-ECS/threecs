import "../styles.16b1c26f.js";
import {o as ACESFilmicToneMapping, s as sRGBEncoding, G as GLTFLoader} from "../vendor.2af62ae5.js";
import {l as loadPhysicsSystem, b as defineComponent, a as defineSystem, P as PhysicsCharacterControllerActions, O as Object3DComponent, c as createThreeWorld, F as FirstPersonCameraSystem, i as PhysicsCharacterControllerSystem, A as AnimationSystem, j as FirstPersonCameraActions, k as ActionType, B as BindingType, m as addPhysicsWorldComponent, n as addPhysicsCharacterControllerEntity, g as addComponent, e as addObject3DEntity, o as addAnimationClipsComponent, p as addRigidBodyComponent, q as PhysicsColliderShape, s as addAnimationMixerComponent, t as singletonQuery, h as defineQuery, u as FirstPersonCameraYawTarget, v as FirstPersonCameraPitchTarget} from "../AnimationSystem.82b0b2be.js";
var outdoorFestivalUrl = "/threecs/assets/OutdoorFestival.28575e2c.glb";
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
  const {world, scene, sceneEid, camera, cameraEid, renderer, start} = createThreeWorld({
    pointerLock: true,
    systems: [
      FirstPersonCameraSystem,
      PhysicsCharacterControllerSystem,
      AnimationSystem,
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
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = sRGBEncoding;
  addPhysicsWorldComponent(world, sceneEid);
  const [playerRigEid, playerRig] = addPhysicsCharacterControllerEntity(world, scene);
  addComponent(world, FirstPersonCameraYawTarget, playerRigEid);
  addComponent(world, CrouchMeshTarget, playerRigEid);
  addComponent(world, FirstPersonCameraPitchTarget, cameraEid);
  addComponent(world, CrouchCameraTarget, cameraEid);
  playerRig.add(camera);
  playerRig.position.set(0, 0.1, 5);
  camera.position.set(0, 1.6, 0);
  const {scene: gltfScene, animations} = await new GLTFLoader().loadAsync(outdoorFestivalUrl);
  const gltfEid = addObject3DEntity(world, gltfScene, scene);
  addAnimationClipsComponent(world, gltfEid, animations);
  const animationMixerState = [];
  scene.traverse((child) => {
    const gltfExtensions = child.userData.gltfExtensions;
    if (gltfExtensions) {
      const components = gltfExtensions.MOZ_hubs_components;
      if (components) {
        if (components["nav-mesh"]) {
          child.visible = false;
        }
        if (components["loop-animation"]) {
          const {activeClipIndices} = components["loop-animation"];
          for (const index of activeClipIndices) {
            animationMixerState.push({
              index,
              playing: true
            });
          }
        }
      }
    }
    if (child.isMesh) {
      const eid = addObject3DEntity(world, child);
      addRigidBodyComponent(world, eid, {
        shape: PhysicsColliderShape.Trimesh
      });
    }
  });
  addAnimationMixerComponent(world, gltfEid, {
    state: animationMixerState
  });
  start();
}
main().catch(console.error);
