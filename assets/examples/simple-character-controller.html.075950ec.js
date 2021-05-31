import "../styles.16b1c26f.js";
import {O as Object3D, n as TextureLoader, l as Mesh, B as BoxGeometry, o as MeshBasicMaterial} from "../vendor.9d3ec889.js";
import {c as createThreeWorld, F as FirstPersonCameraSystem, D as DirectionalMovementSystem, e as FirstPersonCameraActions, f as ActionType, B as BindingType, z as DirectionalMovementActions, j as addObject3DEntity, i as addComponent, E as DirectionalMovementComponent, q as FirstPersonCameraYawTarget, r as FirstPersonCameraPitchTarget} from "../AnimationSystem.fc8c672d.js";
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
