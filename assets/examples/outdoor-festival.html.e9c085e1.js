var __defProp = Object.defineProperty;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __assign = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __rest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
import "../styles.9cab3664.js";
import {t as ACESFilmicToneMapping, u as sRGBEncoding, o as AudioListener, G as GLTFLoader} from "../vendor.62f47fd4.js";
import {l as loadPhysicsSystem, b as defineComponent, s as singletonQuery, h as defineQuery, a as defineSystem, P as PhysicsCharacterControllerActions, O as Object3DComponent, c as createThreeWorld, F as FirstPersonCameraSystem, i as PhysicsCharacterControllerSystem, A as AnimationSystem, j as AudioSystem, k as FirstPersonCameraActions, m as ActionType, B as BindingType, n as addPhysicsWorldComponent, o as addPhysicsCharacterControllerEntity, g as addComponent, p as FirstPersonCameraYawTarget, q as FirstPersonCameraPitchTarget, t as addAudioListenerComponent, e as addObject3DEntity, u as addAnimationClipsComponent, v as addAudioSourceComponent, w as addRigidBodyComponent, x as PhysicsColliderShape, y as addAnimationMixerComponent} from "../AudioSystem.65b078a0.js";
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
      AudioSystem,
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
  addAudioListenerComponent(world, cameraEid);
  const audioListener = new AudioListener();
  playerRig.add(audioListener);
  const {
    scene: gltfScene,
    animations,
    parser: {
      options: {path: gltfPath}
    }
  } = await new GLTFLoader().loadAsync("../outdoor-festival/OutdoorFestival.glb");
  const gltfRootPath = new URL(gltfPath, window.location).href;
  const gltfEid = addObject3DEntity(world, gltfScene, scene);
  addAnimationClipsComponent(world, gltfEid, animations);
  const animationMixerState = [];
  scene.traverse((child) => {
    var _a;
    const eid = addObject3DEntity(world, child);
    const components = (_a = child.userData.gltfExtensions) == null ? void 0 : _a.MOZ_hubs_components;
    if (components) {
      if (components["visible"]) {
        child.visible = components["visible"].visible;
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
      if (components["audio"]) {
        const _b = components["audio"], {src} = _b, rest = __rest(_b, ["src"]);
        addAudioSourceComponent(world, eid, __assign({
          src: new URL(src, gltfRootPath).href
        }, rest));
      }
    }
    if (child.isMesh && !child.isSkinnedMesh) {
      if (components && (components["nav-mesh"] || components["trimesh"])) {
        return;
      }
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
const loadButton = document.getElementById("load-button");
const onLoad = () => {
  loadButton.removeEventListener("click", onLoad);
  loadButton.innerText = "Loading...";
  main().then(() => {
    loadButton.remove();
    document.querySelector(".controls").classList.remove("hide");
  }).catch(console.error);
};
loadButton.addEventListener("click", onLoad);
