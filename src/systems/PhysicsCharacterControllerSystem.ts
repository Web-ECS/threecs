import * as Rapier from "@dimforge/rapier3d-compat";
import { Vector2, Vector3, Quaternion, Object3D } from "three";
import { Object3DComponent } from "../components";
import {
  defineSystem,
  World,
  defineMapComponent,
  defineQuery,
  enterQuery,
  addMapComponent,
  addObject3DEntity,
} from "../core/ECS";
import { ButtonActionState } from "./ActionMappingSystem";
import {
  addRigidBodyComponent,
  InternalRigidBodyComponent,
  mainPhysicsWorldQuery,
  createInteractionGroup,
  PhysicsGroups,
  PhysicsWorldComponent,
  InternalPhysicsWorldComponent,
  RigidBodyComponent,
  PhysicsBodyStatus,
  PhysicsColliderShape,
} from "./PhysicsSystem";

export const PhysicsCharacterControllerGroup = 0x0000_0001;
export const CharacterPhysicsGroup = 0b1;
export const CharacterInteractionGroup = createInteractionGroup(
  CharacterPhysicsGroup,
  PhysicsGroups.All
);

function physicsCharacterControllerAction(key: string) {
  return "PhysicsCharacterController/" + key;
}

export const PhysicsCharacterControllerActions = {
  Move: physicsCharacterControllerAction("Move"),
  Jump: physicsCharacterControllerAction("Jump"),
  Sprint: physicsCharacterControllerAction("Sprint"),
  Crouch: physicsCharacterControllerAction("Crouch"),
};

interface PhysicsCharacterControllerProps {
  walkSpeed: number;
  jumpHeight: number;
}

export const PhysicsCharacterControllerComponent =
  defineMapComponent<PhysicsCharacterControllerProps>();

export function addPhysicsCharacterControllerComponent(
  world: World,
  eid: number,
  props: Partial<PhysicsCharacterControllerProps> = {}
) {
  addMapComponent(
    world,
    PhysicsCharacterControllerComponent,
    eid,
    Object.assign(
      {
        walkSpeed: 1,
        jumpHeight: 2.5,
      },
      props
    )
  );
}

interface InternalPhysicsCharacterController {
  velocity?: Vector3;
  translation?: Vector3;
  shapeCastDir?: Vector3;
  shapeCastTranslation?: Vector3;
  shapeCastRotation?: Quaternion;
  interactionGroup?: number;
}

export const InternalPhysicsCharacterControllerComponent =
  defineMapComponent<InternalPhysicsCharacterController>();

export function addPhysicsCharacterControllerEntity(
  world: World,
  scene: Object3D,
  props?: any
) {
  const playerRig = new Object3D();
  const playerRigEid = addObject3DEntity(world, playerRig, scene);
  addPhysicsCharacterControllerComponent(world, playerRigEid);
  addRigidBodyComponent(world, playerRigEid, {
    bodyStatus: PhysicsBodyStatus.Dynamic,
    shape: PhysicsColliderShape.Capsule,
    halfHeight: 0.8,
    radius: 0.5,
    translation: new Vector3(0, 0.8, 0),
    collisionGroups: CharacterInteractionGroup,
    solverGroups: CharacterInteractionGroup,
  });
  return [playerRigEid, playerRig];
}

const physicsCharacterControllerQuery = defineQuery([
  PhysicsCharacterControllerComponent,
  InternalRigidBodyComponent,
  Object3DComponent,
]);

const physicsCharacterControllerAddedQuery = enterQuery(
  physicsCharacterControllerQuery
);

export const PhysicsCharacterControllerSystem = defineSystem(
  function PhysicsCharacterControllerSystem(world: World) {
    const physicsWorldEid = mainPhysicsWorldQuery(world);
    const entities = physicsCharacterControllerQuery(world);
    const addedEntities = physicsCharacterControllerAddedQuery(world);

    addedEntities.forEach((eid) => {
      addMapComponent(world, InternalPhysicsCharacterControllerComponent, eid, {
        velocity: new Vector3(),
        translation: new Vector3(),
        shapeCastDir: new Vector3(),
        shapeCastTranslation: new Vector3(),
        shapeCastRotation: new Quaternion(),
        interactionGroup: createInteractionGroup(
          PhysicsGroups.All,
          ~CharacterPhysicsGroup
        ),
      });
    });

    if (physicsWorldEid === undefined) {
      return;
    }

    const { gravity } = PhysicsWorldComponent.storage.get(physicsWorldEid)!;
    const internalPhysicsWorldComponent =
      InternalPhysicsWorldComponent.storage.get(physicsWorldEid);

    if (!internalPhysicsWorldComponent) {
      return;
    }

    const { physicsWorld } = internalPhysicsWorldComponent;

    entities.forEach((eid) => {
      const character = PhysicsCharacterControllerComponent.storage.get(eid)!;
      const internalCharacter =
        InternalPhysicsCharacterControllerComponent.storage.get(eid)!;
      const obj = Object3DComponent.storage.get(eid)!;
      const rigidBody = RigidBodyComponent.storage.get(eid)!;
      const internalRigidBody = InternalRigidBodyComponent.storage.get(eid)!;

      // Handle Input
      const moveVec = world.actions.get(
        PhysicsCharacterControllerActions.Move
      ) as Vector2;

      const jump = world.actions.get(
        PhysicsCharacterControllerActions.Jump
      ) as ButtonActionState;

      const _walkSpeed =
        character.walkSpeed === undefined ? 1 : character.walkSpeed;
      const _jumpHeight =
        character.jumpHeight === undefined ? 1 : character.jumpHeight;

      internalCharacter.velocity!.z = -moveVec.y * _walkSpeed;
      internalCharacter.velocity!.x = moveVec.x * _walkSpeed;

      internalCharacter.velocity!.y += gravity!.y * world.dt;

      if (jump.pressed) {
        internalCharacter.velocity!.y += Math.sqrt(
          2 * _jumpHeight * Math.abs(gravity!.y)
        );
      }
    });
  }
);
