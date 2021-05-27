import * as Rapier from "@dimforge/rapier3d-compat";
import { Vector2, Vector3, Mesh, Quaternion, ArrowHelper } from "three";
import { Object3DComponent } from "../components";
import {
  System,
  defineSystem,
  World,
  defineMapComponent,
  defineQuery,
  enterQuery,
  singletonQuery,
  addMapComponent,
} from "../core/ECS";
import { ButtonActionState } from "./ActionMappingSystem";
import { sceneQuery } from "./RendererSystem";

export enum PhysicsGroups {
  None = 0,
  All = 0xffff,
}

export enum PhysicsInteractionGroups {
  None = 0,
  Default = 0xffff_ffff,
}

export const CharacterPhysicsGroup = 0b1;
export const CharacterInteractionGroup = createInteractionGroup(
  CharacterPhysicsGroup,
  PhysicsGroups.All
);

interface PhysicsWorldProps {
  gravity?: Vector3;
  updateGravity?: boolean;
  debug?: boolean;
}

export const PhysicsWorldComponent = defineMapComponent<PhysicsWorldProps>();

export const PhysicsBodyStatus = Rapier.BodyStatus;

export enum PhysicsColliderShape {
  Box = "Box",
  Sphere = "Sphere",
  Capsule = "Capsule",
}

interface PhysicsRigidBodyProps {
  translation?: Vector3;
  rotation?: Quaternion;
  shape?: PhysicsColliderShape;
  bodyStatus?: Rapier.BodyStatus;
  solverGroups?: number;
  collisionGroups?: number;
}

interface CapsuleRigidBodyProps extends PhysicsRigidBodyProps {
  shape: PhysicsColliderShape.Capsule;
  halfHeight: number;
  radius: number;
}

export const PhysicsRigidBodyComponent =
  defineMapComponent<CapsuleRigidBodyProps | PhysicsRigidBodyProps>();

const physicsWorldQuery = defineQuery([PhysicsWorldComponent]);
const newPhysicsWorldsQuery = enterQuery(physicsWorldQuery);

const rigidBodiesQuery = defineQuery([
  PhysicsRigidBodyComponent,
  Object3DComponent,
]);
const newRigidBodiesQuery = enterQuery(rigidBodiesQuery);

interface RapierPhysicsWorldProps {
  physicsWorld?: Rapier.World;
  eventQueue?: Rapier.EventQueue;
  colliderHandleToEntityMap?: Map<number, number>;
}

const RapierPhysicsWorldComponent =
  defineMapComponent<RapierPhysicsWorldProps>();
interface RapierPhysicsRigidBodyProps {
  body?: Rapier.RigidBody;
  colliderShape?: Rapier.Shape;
}

const RapierPhysicsRigidBodyComponent =
  defineMapComponent<RapierPhysicsRigidBodyProps>();

interface PhysicsRaycasterProps {
  useObject3DTransform?: boolean;
  transformNeedsUpdate?: boolean;
  transformAutoUpdate?: boolean;
  withIntersection?: boolean;
  withNormal?: boolean;
  origin?: Vector3;
  dir?: Vector3;
  colliderEid?: number;
  toi?: number;
  intersection?: Vector3;
  normal?: Vector3;
  maxToi?: number;
  groups?: number;
  debug?: boolean;
}

export const PhysicsRaycasterComponent =
  defineMapComponent<PhysicsRaycasterProps>();

const physicsRaycasterQuery = defineQuery([PhysicsRaycasterComponent]);
const newPhysicsRaycastersQuery = enterQuery(physicsRaycasterQuery);
const mainSceneQuery = singletonQuery(sceneQuery);

interface RapierRaycasterProps {
  ray?: Rapier.Ray;
  arrowHelper?: ArrowHelper;
}

const RapierRaycasterComponent = defineMapComponent<RapierRaycasterProps>();

export const PhysicsCharacterControllerGroup = 0x0000_0001;

export async function loadRapierPhysicsSystem(): Promise<System> {
  await Rapier.init();

  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();

  return defineSystem(function RapierPhysicsSystem(world: World) {
    const physicsWorldEntities = physicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);
    const physicsRaycasterEntities = physicsRaycasterQuery(world);
    const newPhysicsRaycasterEntities = newPhysicsRaycastersQuery(world);
    const sceneEid = mainSceneQuery(world);

    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(eid)!;
      RapierPhysicsWorldComponent.storage.get(eid)!;

      const gravityConfig = physicsWorldComponent.gravity;
      const physicsWorld = new Rapier.World(
        gravityConfig || new Vector3(0, -9.8)
      );

      const eventQueue = new Rapier.EventQueue(true);

      addMapComponent(world, RapierPhysicsWorldComponent, eid, {
        physicsWorld,
        eventQueue,
        colliderHandleToEntityMap: new Map(),
      });
    });

    physicsWorldEntities.forEach((physicsWorldEid) => {
      const physicsWorldComponent =
        PhysicsWorldComponent.storage.get(physicsWorldEid)!;
      const rapierPhysicsWorldComponent =
        RapierPhysicsWorldComponent.storage.get(physicsWorldEid)!;

      const { gravity, updateGravity } = physicsWorldComponent;
      const { physicsWorld, eventQueue, colliderHandleToEntityMap } =
        rapierPhysicsWorldComponent;

      newRigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid)!;
        const { bodyStatus, shape, translation, rotation, ...rigidBodyProps } =
          PhysicsRigidBodyComponent.storage.get(rigidBodyEid)!;

        const geometry = (obj as Mesh).geometry;

        if (!geometry && !shape) {
          return;
        }

        obj.getWorldPosition(tempVec3);
        obj.getWorldQuaternion(tempQuat);

        const rigidBodyDesc = new Rapier.RigidBodyDesc(
          bodyStatus !== undefined ? bodyStatus : PhysicsBodyStatus.Static
        );

        rigidBodyDesc.setRotation(tempQuat);
        rigidBodyDesc.setTranslation(tempVec3.x, tempVec3.y, tempVec3.z);

        const body = physicsWorld!.createRigidBody(rigidBodyDesc);

        let colliderShape: Rapier.Shape;

        const geometryType = geometry && geometry.type;

        if (geometryType === "BoxGeometry") {
          geometry.computeBoundingBox();
          const boundingBoxSize = geometry.boundingBox!.getSize(new Vector3());
          colliderShape = new Rapier.Cuboid(
            boundingBoxSize.x / 2,
            boundingBoxSize.y / 2,
            boundingBoxSize.z / 2
          );
        } else if (geometryType === "SphereGeometry") {
          geometry.computeBoundingSphere();
          const radius = geometry.boundingSphere!.radius;
          colliderShape = new Rapier.Ball(radius);
        } else if (shape === PhysicsColliderShape.Capsule) {
          const { radius, halfHeight } =
            rigidBodyProps as CapsuleRigidBodyProps;
          colliderShape = new Rapier.Capsule(halfHeight, radius);
        } else {
          throw new Error("Unimplemented");
        }

        const colliderDesc = new Rapier.ColliderDesc(colliderShape);

        if (translation) {
          colliderDesc.setTranslation(
            translation.x,
            translation.y,
            translation.z
          );
        }

        if (rotation) {
          colliderDesc.setRotation(rotation);
        }

        if (rigidBodyProps.collisionGroups === undefined) {
          rigidBodyProps.collisionGroups = PhysicsInteractionGroups.Default;
        }

        if (rigidBodyProps.solverGroups === undefined) {
          rigidBodyProps.solverGroups = PhysicsInteractionGroups.Default;
        }

        colliderDesc.setCollisionGroups(rigidBodyProps.collisionGroups);
        colliderDesc.setSolverGroups(rigidBodyProps.solverGroups);

        // TODO: Handle mass / density
        // TODO: Handle scale
        // TODO: Handle dynamic gravity

        const collider = physicsWorld!.createCollider(
          colliderDesc,
          body.handle
        );

        colliderHandleToEntityMap!.set(collider.handle, rigidBodyEid);

        addMapComponent(world, RapierPhysicsRigidBodyComponent, rigidBodyEid, {
          body,
          colliderShape,
        });
      });

      newPhysicsRaycasterEntities.forEach((raycasterEid) => {
        const raycaster = PhysicsRaycasterComponent.storage.get(raycasterEid)!;

        raycaster.intersection = new Vector3();
        raycaster.normal = new Vector3();

        if (raycaster.useObject3DTransform === undefined) {
          raycaster.useObject3DTransform = true;
        }

        if (raycaster.withIntersection === undefined) {
          raycaster.withIntersection = false;
        }

        if (raycaster.withNormal === undefined) {
          raycaster.withNormal = false;
        }

        if (!raycaster.origin) {
          raycaster.origin = new Vector3(0, 0, 0);
        }

        if (!raycaster.dir) {
          raycaster.dir = new Vector3(0, 0, -1);
        }

        if (
          raycaster.useObject3DTransform &&
          raycaster.transformAutoUpdate === undefined
        ) {
          raycaster.transformAutoUpdate = true;
          raycaster.transformNeedsUpdate = true;
        } else if (raycaster.transformNeedsUpdate === undefined) {
          raycaster.transformNeedsUpdate = true;
        }

        if (raycaster.maxToi === undefined) {
          raycaster.maxToi = Number.MAX_VALUE;
        }

        if (raycaster.groups === undefined) {
          raycaster.groups = PhysicsInteractionGroups.Default;
        }

        RapierRaycasterComponent.storage.set(raycasterEid, {
          ray: new Rapier.Ray(raycaster.origin, raycaster.dir),
        });
      });

      if (gravity && updateGravity) {
        physicsWorld!.gravity.x = gravity!.x;
        physicsWorld!.gravity.y = gravity!.y;
        physicsWorld!.gravity.z = gravity!.z;
        physicsWorldComponent.updateGravity = false;
      }

      physicsWorld!.step(eventQueue);

      eventQueue!.drainContactEvents((handle1, handle2, contactStarted) => {
        const collider1 = physicsWorld!.getCollider(handle1);
        const collider2 = physicsWorld!.getCollider(handle2);

        // console.log(
        //   "Contact between:",
        //   collider1,
        //   "and",
        //   collider2,
        //   ". Started:",
        //   contactStarted
        // );
      });

      eventQueue!.drainIntersectionEvents((handle1, handle2, intersecting) => {
        const collider1 = physicsWorld!.getCollider(handle1);
        const collider2 = physicsWorld!.getCollider(handle2);

        // console.log(
        //   "Intersection between: ",
        //   collider1,
        //   "and",
        //   collider2,
        //   ". Currently intersecting:",
        //   intersecting
        // );
      });

      physicsRaycasterEntities.forEach((rayCasterEid) => {
        const raycaster = PhysicsRaycasterComponent.storage.get(rayCasterEid)!;
        const obj = Object3DComponent.storage.get(rayCasterEid);

        if (
          raycaster.useObject3DTransform &&
          obj &&
          (raycaster.transformNeedsUpdate || raycaster.transformAutoUpdate)
        ) {
          obj.getWorldPosition(raycaster.origin!);
          obj.getWorldDirection(raycaster.dir!);

          if (!raycaster.transformAutoUpdate) {
            raycaster.transformNeedsUpdate = false;
          }
        }

        const internalRaycaster =
          RapierRaycasterComponent.storage.get(rayCasterEid)!;

        const colliderSet = physicsWorld!.colliders;

        let intersection;

        if (raycaster.withNormal) {
          intersection = physicsWorld!.queryPipeline.castRayAndGetNormal(
            colliderSet,
            internalRaycaster.ray!,
            raycaster.maxToi!,
            true,
            raycaster.groups!
          );

          if (intersection) {
            raycaster.normal!.copy(intersection.normal as Vector3);
          } else {
            raycaster.normal!.set(0, 0, 0);
          }
        } else {
          intersection = physicsWorld!.queryPipeline.castRay(
            colliderSet,
            internalRaycaster.ray!,
            raycaster.maxToi!,
            true,
            raycaster.groups!
          );
        }

        if (intersection) {
          raycaster.colliderEid = colliderHandleToEntityMap!.get(
            intersection.colliderHandle
          );
          raycaster.toi = intersection.toi;
        } else {
          raycaster.colliderEid = undefined;
          raycaster.toi = undefined;
        }

        if (raycaster.withIntersection) {
          if (raycaster.colliderEid !== undefined) {
            raycaster
              .intersection!.addVectors(raycaster.origin!, raycaster.dir!)
              .multiplyScalar(raycaster.toi!);
          } else {
            raycaster.intersection!.set(0, 0, 0);
          }
        }

        if (raycaster.debug) {
          if (!internalRaycaster.arrowHelper) {
            internalRaycaster.arrowHelper = new ArrowHelper(
              raycaster.dir,
              raycaster.origin,
              raycaster.toi,
              0xffff00,
              0.2,
              0.1
            );
            const scene = Object3DComponent.storage.get(sceneEid!)!;
            scene.add(internalRaycaster.arrowHelper);
          } else {
            const arrowHelper = internalRaycaster.arrowHelper;
            arrowHelper.position.copy(raycaster.origin!);
            arrowHelper.setDirection(raycaster.dir!);
            arrowHelper.setLength(raycaster.toi!, 0.2, 0.1);
          }
        } else if (!raycaster.debug && internalRaycaster.arrowHelper) {
          const scene = Object3DComponent.storage.get(sceneEid!)!;
          scene.remove(internalRaycaster.arrowHelper);
          internalRaycaster.arrowHelper = undefined;
        }
      });

      rigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid)!;
        const { body } =
          RapierPhysicsRigidBodyComponent.storage.get(rigidBodyEid)!;

        if (body!.isDynamic()) {
          const translation = body!.translation();
          const rotation = body!.rotation();
          obj.position.set(translation.x, translation.y, translation.z);
          obj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        } else if (body!.isKinematic()) {
          body!.setNextKinematicTranslation(obj.position);
          body!.setNextKinematicRotation(obj.quaternion);
        }
      });
    });
  });
}

export const PhysicsCharacterControllerActions = {
  Move: "PhysicsCharacterController/Move",
  Jump: "PhysicsCharacterController.Jump",
};

interface PhysicsCharacterControllerProps {
  walkSpeed?: number;
  jumpHeight?: number;
}

export const PhysicsCharacterControllerComponent =
  defineMapComponent<PhysicsCharacterControllerProps>();

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
  RapierPhysicsRigidBodyComponent,
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
      const physicsWorldComponent =
        RapierPhysicsWorldComponent.storage.get(worldEid);

      if (!physicsWorldComponent) {
        return;
      }

      const { physicsWorld } = physicsWorldComponent;

      entities.forEach((eid) => {
        const character = PhysicsCharacterControllerComponent.storage.get(eid)!;
        const internalCharacter =
          InternalPhysicsCharacterControllerComponent.storage.get(eid)!;
        const obj = Object3DComponent.storage.get(eid)!;
        const rigidBody = PhysicsRigidBodyComponent.storage.get(eid)!;
        const internalRigidBody =
          RapierPhysicsRigidBodyComponent.storage.get(eid)!;

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

        // Move Kinematic Body
        moveAndSlide(
          physicsWorld!,
          internalRigidBody.colliderShape!,
          rigidBody.translation!,
          rigidBody.rotation!,
          obj.position,
          obj.quaternion,
          internalCharacter.velocity!,
          world.dt,
          internalCharacter.interactionGroup!,
          1,
          Math.PI / 4
        );
      });
    });
  }
);

export function createInteractionGroup(groups: number, mask: number) {
  return (groups << 16) | mask;
}

const motion = new Vector3();
const remainder = new Vector3();
const travel = new Vector3();
const shapePosition = new Vector3();
const shapeRotation = new Quaternion();
const zeroVec3 = new Vector3();
const downDir = new Vector3();
const upDir = new Vector3();
const FLOOR_ANGLE_THRESHOLD = 0.01;
const normalizedVelocity = new Vector3();
const deltaV = new Vector3();
const normal = new Vector3();
const castOffset = new Vector3(0, 0.005, 0);

// Ported (poorly) from https://github.com/godotengine/godot/blob/master/scene/3d/physics_body_3d.cpp#L849
// Incomplete and buggy, but may be useful for others.

function moveAndSlide(
  world: Rapier.World,
  shape: Rapier.Shape,
  shapePositionOffset: Vector3,
  shapeRotationOffset: Quaternion,
  position: Vector3,
  rotation: Quaternion,
  velocity: Vector3,
  dt: number,
  interactionGroup: number,
  maxSlides: number,
  maxFloorAngle: number
) {
  downDir.copy(world.gravity as Vector3).normalize();
  upDir.copy(downDir).negate();
  normalizedVelocity.copy(velocity).normalize();

  motion.copy(velocity).multiplyScalar(dt);

  shapePosition.copy(position);

  if (shapePositionOffset) {
    shapePosition.add(shapePositionOffset).add(castOffset);
  }

  shapeRotation.copy(rotation);

  if (shapeRotationOffset) {
    shapeRotation.multiply(shapeRotationOffset);
  }

  let slides = maxSlides;

  while (slides) {
    let foundCollision = false;

    for (let i = 0; i < 2; i++) {
      normal.set(0, 0, 0);
      remainder.set(0, 0, 0);
      travel.set(0, 0, 0);

      if (i === 0) {
        const result = world.castShape(
          world.colliders,
          shapePosition,
          shapeRotation,
          velocity,
          shape,
          dt,
          interactionGroup
        );

        if (!result) {
          motion.set(0, 0, 0);
        } else {
          foundCollision = true;
          travel.copy(velocity as Vector3).multiplyScalar(result.toi);
          position.add(travel);
          remainder.copy(motion).sub(travel);
          normal.copy(result.normal2 as Vector3);
        }
      } else {
        const result = world.castShape(
          world.colliders,
          shapePosition,
          shapeRotation,
          velocity,
          shape,
          dt,
          interactionGroup
        );

        if (result) {
          foundCollision = true;
          travel.set(0, 0, 0);
          remainder.copy(motion);
          normal.copy(result.normal2 as Vector3);
        }
      }

      const onFloor =
        Math.acos(normal.dot(upDir)) < maxFloorAngle + FLOOR_ANGLE_THRESHOLD;

      if (foundCollision) {
        motion.copy(remainder);

        if (
          onFloor &&
          deltaV.addVectors(normalizedVelocity, upDir).length() < 0.01 &&
          travel.length() < 1
        ) {
          slideAlongNormal(travel, upDir, motion);
          position.sub(motion);
          return;
        }

        slideAlongNormal(motion, normal, motion);
        slideAlongNormal(velocity, normal, velocity);
      }

      if (!foundCollision || motion.equals(zeroVec3)) {
        break;
      }
    }

    --slides;
  }
}

function slideAlongNormal(
  vec: Vector3,
  normal: Vector3,
  target: Vector3
): Vector3 {
  return target
    .copy(normal)
    .multiplyScalar(2)
    .multiplyScalar(vec.dot(normal))
    .sub(vec);
}
