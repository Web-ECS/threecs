import * as Rapier from "@dimforge/rapier3d-compat";
import { Vector3, Mesh, Quaternion, ArrowHelper, Euler } from "three";
import { Object3DComponent } from "../components";
import {
  System,
  defineSystem,
  World,
  defineMapComponent,
  defineQuery,
  enterQuery,
  addMapComponent,
} from "../core/ECS";
import { mainSceneQuery } from "./RendererSystem";

export enum PhysicsGroups {
  None = 0,
  All = 0xffff,
}

export enum PhysicsInteractionGroups {
  None = 0,
  Default = 0xffff_ffff,
}

export function createInteractionGroup(groups: number, mask: number) {
  return (groups << 16) | mask;
}

interface PhysicsWorldProps {
  gravity: Vector3;
  debug: boolean;
}

export const PhysicsWorldComponent = defineMapComponent<PhysicsWorldProps>();

export function addPhysicsWorldComponent(
  world: World,
  eid: number,
  props: Partial<PhysicsWorldProps>
) {
  addMapComponent(world, PhysicsWorldComponent, eid, {
    gravity: props.gravity || new Vector3(0, -9.81, 0),
    debug: !!props.debug,
  });
}

export const PhysicsBodyStatus = Rapier.BodyStatus;

export enum PhysicsColliderShape {
  Box = "Box",
  Sphere = "Sphere",
  Capsule = "Capsule",
}

interface PhysicsRigidBodyProps {
  translation?: Vector3;
  rotation?: Euler;
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

export const physicsWorldQuery = defineQuery([PhysicsWorldComponent]);
export const newPhysicsWorldsQuery = enterQuery(physicsWorldQuery);

export const rigidBodiesQuery = defineQuery([
  PhysicsRigidBodyComponent,
  Object3DComponent,
]);
export const newRigidBodiesQuery = enterQuery(rigidBodiesQuery);

interface InternalPhysicsWorldProps {
  physicsWorld?: Rapier.World;
  colliderHandleToEntityMap?: Map<number, number>;
}

export const InternalPhysicsWorldComponent =
  defineMapComponent<InternalPhysicsWorldProps>();
interface InternalPhysicsRigidBodyProps {
  body?: Rapier.RigidBody;
}

export const InternalPhysicsRigidBodyComponent =
  defineMapComponent<InternalPhysicsRigidBodyProps>();

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

export const physicsRaycasterQuery = defineQuery([PhysicsRaycasterComponent]);
export const newPhysicsRaycastersQuery = enterQuery(physicsRaycasterQuery);

interface InternalRaycasterProps {
  ray?: Rapier.Ray;
  arrowHelper?: ArrowHelper;
}

export const InternalRaycasterComponent =
  defineMapComponent<InternalRaycasterProps>();

export async function loadPhysicsSystem(): Promise<System> {
  await Rapier.init();

  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();

  return defineSystem(function PhysicsSystem(world: World) {
    const physicsWorldEntities = physicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);
    const physicsRaycasterEntities = physicsRaycasterQuery(world);
    const newPhysicsRaycasterEntities = newPhysicsRaycastersQuery(world);
    const sceneEid = mainSceneQuery(world);

    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(eid)!;
      InternalPhysicsWorldComponent.storage.get(eid)!;

      if (!physicsWorldComponent.gravity) {
        physicsWorldComponent.gravity = new Vector3(0, -9.8, 0);
      }

      const physicsWorld = new Rapier.World(physicsWorldComponent.gravity);

      addMapComponent(world, InternalPhysicsWorldComponent, eid, {
        physicsWorld,
        colliderHandleToEntityMap: new Map(),
      });
    });

    physicsWorldEntities.forEach((physicsWorldEid) => {
      const internalPhysicsWorldComponent =
        InternalPhysicsWorldComponent.storage.get(physicsWorldEid)!;
      const { physicsWorld, colliderHandleToEntityMap } =
        internalPhysicsWorldComponent;

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

        rigidBodyDesc.setRotation(
          new Rapier.Quaternion(tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w)
        );
        rigidBodyDesc.setTranslation(tempVec3.x, tempVec3.y, tempVec3.z);

        const body = physicsWorld!.createRigidBody(rigidBodyDesc);

        let colliderDesc: Rapier.ColliderDesc;

        const geometryType = geometry && geometry.type;

        if (geometryType === "BoxGeometry") {
          geometry.computeBoundingBox();
          const boundingBoxSize = geometry.boundingBox!.getSize(new Vector3());
          colliderDesc = Rapier.ColliderDesc.cuboid(
            boundingBoxSize.x / 2,
            boundingBoxSize.y / 2,
            boundingBoxSize.z / 2
          );
        } else if (geometryType === "SphereGeometry") {
          geometry.computeBoundingSphere();
          const radius = geometry.boundingSphere!.radius;
          colliderDesc = Rapier.ColliderDesc.ball(radius);
        } else if (shape === PhysicsColliderShape.Capsule) {
          const { radius, halfHeight } =
            rigidBodyProps as CapsuleRigidBodyProps;
          colliderDesc = Rapier.ColliderDesc.capsule(halfHeight, radius);
        } else {
          throw new Error("Unimplemented");
        }

        if (translation) {
          colliderDesc.setTranslation(
            translation.x,
            translation.y,
            translation.z
          );
        }

        if (rotation) {
          tempQuat.setFromEuler(rotation);
          colliderDesc.setRotation(
            new Rapier.Quaternion(
              tempQuat.x,
              tempQuat.y,
              tempQuat.z,
              tempQuat.w
            )
          );
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

        const collider = physicsWorld!.createCollider(
          colliderDesc,
          body.handle
        );

        colliderHandleToEntityMap!.set(collider.handle, rigidBodyEid);

        addMapComponent(
          world,
          InternalPhysicsRigidBodyComponent,
          rigidBodyEid,
          {
            body,
          }
        );
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

        InternalRaycasterComponent.storage.set(raycasterEid, {
          ray: new Rapier.Ray(raycaster.origin, raycaster.dir),
        });
      });

      physicsWorld!.step();

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
          InternalRaycasterComponent.storage.get(rayCasterEid)!;

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
          InternalPhysicsRigidBodyComponent.storage.get(rigidBodyEid)!;

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
