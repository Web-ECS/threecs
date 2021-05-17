import "../styles.16b1c26f.js";
import {O as Object3D, T as TextureLoader, M as Mesh, B as BoxGeometry, a as MeshBasicMaterial} from "../vendor.0520bc5a.js";
import {c as createThreeWorld, F as FirstPersonCameraSystem, D as DirectionalMovementSystem, o as FirstPersonCameraActions, A as ActionType, B as BindingType, p as DirectionalMovementActions, f as addObject3DEntity, h as addComponent, e as crateTextureUrl, q as DirectionalMovementComponent, s as FirstPersonCameraYawTarget, t as FirstPersonCameraPitchTarget} from "../crate.aae10597.js";
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
              up: "Keyboard/w",
              down: "Keyboard/s",
              left: "Keyboard/a",
              right: "Keyboard/d"
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
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
addObject3DEntity(world, cube, scene);
start();
