import * as Rapier from "@dimforge/rapier3d-compat";
import { Vector2, Vector3, Quaternion } from "three";
import { Object3DComponent } from "../components";
import {
  defineSystem,
  World,
  defineMapComponent,
  defineQuery,
  enterQuery,
  addMapComponent,
} from "../core/ECS";
import { ButtonActionState } from "./ActionMappingSystem";
import {
  InternalRigidBodyComponent,
  physicsWorldQuery,
  createInteractionGroup,
  PhysicsGroups,
  PhysicsWorldComponent,
  InternalPhysicsWorldComponent,
  RigidBodyComponent,
} from "./PhysicsSystem";

export const PhysicsCharacterControllerGroup = 0x0000_0001;
export const CharacterPhysicsGroup = 0b1;
export const CharacterInteractionGroup = createInteractionGroup(
  CharacterPhysicsGroup,
  PhysicsGroups.All
);

export const PhysicsCharacterControllerActions = {
  Move: "PhysicsCharacterController/Move",
  Jump: "PhysicsCharacterController.Jump",
};

interface PhysicsCharacterControllerProps {
  walkSpeed: number;
  jumpHeight: number;
}

export const PhysicsCharacterControllerComponent =
  defineMapComponent<PhysicsCharacterControllerProps>();

export function addPhysicsCharacterController(
  world: World,
  eid: number,
  props: Partial<PhysicsCharacterControllerProps>
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
    const physicsWorldEntities = physicsWorldQuery(world);
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

    physicsWorldEntities.forEach((worldEid) => {
      const { gravity } = PhysicsWorldComponent.storage.get(worldEid)!;
      const internalPhysicsWorldComponent =
        InternalPhysicsWorldComponent.storage.get(worldEid);

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
    });
  }
);
