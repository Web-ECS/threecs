var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
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
import { l as loadPhysicsSystem, a as singletonQuery, O as Object3DComponent, c as createThreeWorld, F as FirstPersonCameraSystem, P as PhysicsCharacterControllerSystem, A as AnimationSystem, b as FirstPersonCameraActions, d as ActionType, B as BindingType, e as PhysicsCharacterControllerActions, f as addPhysicsWorldComponent, g as addPhysicsCharacterControllerEntity, h as FirstPersonCameraYawTarget, i as FirstPersonCameraPitchTarget, j as AudioListenerEntity, k as addMapComponent, m as addAnimationClipsComponent, n as PositionalAudioEntity, o as AudioEntity, p as addRigidBodyComponent, q as PhysicsColliderShape, t as addAnimationMixerComponent } from "../AnimationSystem.00f7d807.js";
/* empty css                  */import { d as defineComponent, a as defineQuery, aG as ACESFilmicToneMapping, aH as sRGBEncoding, b as addComponent, aI as GLTFLoader, g as addEntity } from "../vendor.c084ab64.js";
var outdoorFestival_html_htmlProxy_index_0 = "";
function createAudioElement(src) {
  const el = document.createElement("audio");
  el.addEventListener("canplay", () => {
    el.play();
  });
  el.src = src;
  el.playsinline = true;
  return el;
}
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
  const audioListener = new AudioListenerEntity(world);
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
        const _b = components["audio"], { src, audioType, loop, volume } = _b, rest = __objRest(_b, ["src", "audioType", "loop", "volume"]);
        const absoluteUrl = new URL(src, gltfRootPath).href;
        const el = createAudioElement(absoluteUrl);
        el.loop = !!loop;
        let audio;
        if (audioType === "pannernode") {
          audio = new PositionalAudioEntity(world, audioListener);
          audio.setRefDistance(rest.refDistance !== void 0 ? rest.refDistance : 1);
          audio.setRolloffFactor(rest.rolloffFactor !== void 0 ? rest.rolloffFactor : 1);
          audio.setDistanceModel(rest.distanceModel || "inverse");
          audio.setMaxDistance(rest.maxDistance !== void 0 ? rest.maxDistance : 1e4);
          audio.setDirectionalCone(rest.coneInnerAngle !== void 0 ? rest.coneInnerAngle : 360, rest.coneOuterAngle !== void 0 ? rest.coneOuterAngle : 360, rest.coneOuterGain !== void 0 ? rest.coneOuterGain : 0);
        } else {
          audio = new AudioEntity(world, audioListener);
        }
        audio.setMediaElementSource(el);
        audio.gain.gain.value = volume !== void 0 ? volume : 1;
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
