import { c as createThreeWorld, F as FirstPersonCameraSystem, D as DirectionalMovementSystem, b as FirstPersonCameraActions, d as ActionType, B as BindingType, x as DirectionalMovementActions, y as Object3DEntity, v as setChildEntity, z as DirectionalMovementComponent, h as FirstPersonCameraYawTarget, i as FirstPersonCameraPitchTarget, O as Object3DComponent, M as MeshEntity } from "../AnimationSystem.1fc34b0b.js";
/* empty css                  */import { b as addComponent, T as TextureLoader, B as BoxGeometry, M as MeshBasicMaterial } from "../vendor.95af2766.js";
import { c as crateTextureUrl } from "../crate.9cc70004.js";
const setVec3 = (v1, v2) => {
  v1[0] = v2[0];
  v1[1] = v2[1];
  v1[2] = v2[2];
};
const { world, start } = createThreeWorld({
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
const { camera, scene } = world;
const playerRig = new Object3DEntity(world);
setChildEntity(playerRig.eid, camera.eid);
addComponent(world, DirectionalMovementComponent, playerRig.eid);
addComponent(world, FirstPersonCameraYawTarget, playerRig.eid);
setChildEntity(scene.eid, playerRig.eid);
addComponent(world, FirstPersonCameraPitchTarget, camera.eid);
const playerRigPosition = Object3DComponent.position[playerRig.eid];
const cameraPosition = Object3DComponent.position[camera.eid];
setVec3(playerRigPosition, [0, 0.5, 5]);
setVec3(cameraPosition, [0, 1.6, 0]);
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new MeshEntity(world, new BoxGeometry(), new MeshBasicMaterial({ map: crateTexture }));
const cubePosition = Object3DComponent.position[cube.eid];
setVec3(cubePosition, [0, 0.5, 0]);
const ground = new MeshEntity(world, new BoxGeometry(10, 0.1, 10), new MeshBasicMaterial());
setChildEntity(scene.eid, cube.eid);
setChildEntity(scene.eid, ground.eid);
start();
