import "../styles.9cab3664.js";
import {O as Object3D, T as TextureLoader, M as Mesh, B as BoxGeometry, a as MeshBasicMaterial} from "../vendor.6c76840a.js";
import {c as createThreeWorld, F as FirstPersonCameraSystem, D as DirectionalMovementSystem, k as FirstPersonCameraActions, m as ActionType, B as BindingType, E as DirectionalMovementActions, e as addObject3DEntity, g as addComponent, H as DirectionalMovementComponent, p as FirstPersonCameraYawTarget, q as FirstPersonCameraPitchTarget} from "../AudioSystem.3f2ec82b.js";
import {c as crateTextureUrl} from "../crate.9cc70004.js";
const {world, scene, camera, cameraEid, start} = createThreeWorld({
  pointerLock: true,
  systems: [FirstPersonCameraSystem, DirectionalMovementSystem],
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
const playerRig = new Object3D();
const playerRigEid = addObject3DEntity(world, playerRig, scene);
addComponent(world, DirectionalMovementComponent, playerRigEid);
addComponent(world, FirstPersonCameraYawTarget, playerRigEid);
playerRig.add(camera);
addComponent(world, FirstPersonCameraPitchTarget, cameraEid);
playerRig.position.z = 5;
playerRig.position.y = 0.5;
camera.position.y = 1.6;
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
addObject3DEntity(world, cube, scene);
cube.position.y = 0.5;
const ground = new Mesh(new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
addObject3DEntity(world, ground, scene);
start();
