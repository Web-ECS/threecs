var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
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
var __objRest = (source, exclude) => {
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
import { l as loadPhysicsSystem, a as singletonQuery, O as Object3DComponent, c as createThreeWorld, F as FirstPersonCameraSystem, P as PhysicsCharacterControllerSystem, A as AnimationSystem, b as AudioSystem, d as FirstPersonCameraActions, e as ActionType, B as BindingType, f as PhysicsCharacterControllerActions, g as addPhysicsWorldComponent, h as addPhysicsCharacterControllerEntity, i as FirstPersonCameraYawTarget, j as FirstPersonCameraPitchTarget, k as addAudioListenerComponent, m as addMapComponent, n as addAnimationClipsComponent, o as addAudioSourceComponent, p as addRigidBodyComponent, q as PhysicsColliderShape, t as addAnimationMixerComponent } from "../AudioSystem.49d2e024.js";
/* empty css                  */import { d as defineComponent, a as defineQuery, aG as ACESFilmicToneMapping, aH as sRGBEncoding, b as addComponent, am as AudioListener, aI as GLTFLoader, g as addEntity } from "../vendor.95af2766.js";
var outdoorFestival_html_htmlProxy_index_0 = "";
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
  const { scene, camera, renderer } = world;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = sRGBEncoding;
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
  addAudioListenerComponent(world, camera.eid);
  const audioListener = new AudioListener();
  playerRig.add(audioListener);
  const {
    scene: gltfScene,
    animations,
    parser: {
      options: { path: gltfPath }
    }
  } = await new GLTFLoader().loadAsync("../outdoor-festival/OutdoorFestival.glb");
  const gltfRootPath = new URL(gltfPath, window.location).href;
  const gltfEid = addEntity(world);
  addMapComponent(world, Object3DComponent, gltfEid, gltfScene);
  scene.add(gltfScene);
  addAnimationClipsComponent(world, gltfEid, animations);
  const animationMixerState = [];
  scene.traverse((child) => {
    var _a;
    const eid = addEntity(world);
    addMapComponent(world, Object3DComponent, eid, child);
    const components = (_a = child.userData.gltfExtensions) == null ? void 0 : _a.MOZ_hubs_components;
    if (components) {
      if (components["visible"]) {
        child.visible = components["visible"].visible;
      }
      if (components["loop-animation"]) {
        const { activeClipIndices } = components["loop-animation"];
        for (const index of activeClipIndices) {
          animationMixerState.push({
            index,
            playing: true
          });
        }
      }
      if (components["audio"]) {
        const _b = components["audio"], { src } = _b, rest = __objRest(_b, ["src"]);
        addAudioSourceComponent(world, eid, __spreadValues({
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
