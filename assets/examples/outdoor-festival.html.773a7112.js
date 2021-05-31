import "../styles.9cab3664.js";
import {o as ACESFilmicToneMapping, s as sRGBEncoding, q as AudioListener, G as GLTFLoader, t as PositionalAudio, u as Audio} from "../vendor.514f9e0b.js";
import {l as loadPhysicsSystem, b as defineComponent, s as singletonQuery, h as defineQuery, a as defineSystem, P as PhysicsCharacterControllerActions, O as Object3DComponent, c as createThreeWorld, F as FirstPersonCameraSystem, i as PhysicsCharacterControllerSystem, A as AnimationSystem, j as FirstPersonCameraActions, k as ActionType, B as BindingType, m as addPhysicsWorldComponent, n as addPhysicsCharacterControllerEntity, g as addComponent, o as FirstPersonCameraYawTarget, p as FirstPersonCameraPitchTarget, e as addObject3DEntity, q as addAnimationClipsComponent, t as addRigidBodyComponent, u as PhysicsColliderShape, v as addAnimationMixerComponent} from "../AnimationSystem.d20b3d79.js";
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
        const {
          audioType,
          coneInnerAngle,
          coneOuterAngle,
          coneOuterGain,
          distanceModel,
          maxDistance,
          refDistance,
          rolloffFactor,
          src,
          volume,
          loop,
          autoPlay
        } = components["audio"];
        let audio;
        const el = document.createElement("audio");
        el.setAttribute("playsinline", "");
        el.setAttribute("webkip-playsinline", "");
        el.crossOrigin = "anonymous";
        el.src = new URL(src, gltfRootPath);
        el.loop = loop;
        el.autoplay = autoPlay;
        if (audioType === "pannernode") {
          audio = new PositionalAudio(audioListener);
          audio.setDirectionalCone(coneInnerAngle, coneOuterAngle, coneOuterGain);
          audio.setDistanceModel(distanceModel);
          audio.setMaxDistance(maxDistance);
          audio.setRefDistance(refDistance);
          audio.setRolloffFactor(rolloffFactor);
        } else {
          audio = new Audio(audioListener);
        }
        audio.setMediaElementSource(el);
        audio.setVolume(volume);
        child.add(audio);
      }
    }
    if (child.isMesh && !child.isSkinnedMesh) {
      if (components && (components["nav-mesh"] || components["trimesh"])) {
        return;
      }
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
