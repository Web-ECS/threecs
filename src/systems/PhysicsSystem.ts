import Ammo from "ammo-wasm";
import { Vector3, Mesh, BoxGeometry, SphereGeometry, Quaternion } from "three";
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

export enum PhysicsShape {
  Box = "Box",
  Sphere = "Sphere",
}

interface PhysicsWorldProps {
  gravity?: Vector3;
  updateGravity?: boolean;
  debug?: boolean;
}

export const PhysicsWorldComponent = defineMapComponent<PhysicsWorldProps>();

interface InternalPhysicsWorldProps {
  dynamicsWorld?: Ammo.btDiscreteDynamicsWorld;
  gravityVec?: Ammo.btVector3;
}

const InternalPhysicsWorldComponent =
  defineMapComponent<InternalPhysicsWorldProps>();

interface PhysicsRigidBodyProps {
  mass?: number;
  shape?: "auto";
}

export const PhysicsRigidBodyComponent =
  defineMapComponent<PhysicsRigidBodyProps>();

interface InternalPhysicsRigidBodyProps {
  body?: Ammo.btRigidBody;
}

const InternalPhysicsRigidBodyComponent =
  defineMapComponent<InternalPhysicsRigidBodyProps>();

const physicsWorldQuery = defineQuery([PhysicsWorldComponent]);
const newPhysicsWorldsQuery = enterQuery(physicsWorldQuery);

const rigidBodiesQuery = defineQuery([
  PhysicsRigidBodyComponent,
  Object3DComponent,
]);
const newRigidBodiesQuery = enterQuery(rigidBodiesQuery);

export async function loadPhysicsSystem(): Promise<System> {
  const ammo = await Ammo();

  const tempTransform = new ammo.btTransform();
  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();

  return defineSystem(function PhysicsSystem(world: World) {
    const physicsWorldEntities = physicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);

    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(eid)!;
      InternalPhysicsWorldComponent.storage.get(eid)!;

      const collisionConfig = new ammo.btDefaultCollisionConfiguration();
      const dispatcher = new ammo.btCollisionDispatcher(collisionConfig);
      const overlappingPairCache = new ammo.btDbvtBroadphase();
      const solver = new ammo.btSequentialImpulseConstraintSolver();
      const dynamicsWorld = new ammo.btDiscreteDynamicsWorld(
        dispatcher,
        overlappingPairCache,
        solver,
        collisionConfig
      );

      const gravityVec = new ammo.btVector3(0, -9.8, 0);

      const gravityConfig = physicsWorldComponent.gravity;

      if (gravityConfig) {
        gravityVec.setValue(gravityConfig.x, gravityConfig.y, gravityConfig.z);
      }

      dynamicsWorld.setGravity(gravityVec);

      addMapComponent(world, InternalPhysicsWorldComponent, eid, {
        gravityVec,
        dynamicsWorld,
      });
    });

    physicsWorldEntities.forEach((physicsWorldEid) => {
      const physicsWorldComponent =
        PhysicsWorldComponent.storage.get(physicsWorldEid)!;
      const internalPhysicsWorldComponent =
        InternalPhysicsWorldComponent.storage.get(physicsWorldEid)!;

      const { gravity, updateGravity } = physicsWorldComponent;
      const { gravityVec, dynamicsWorld } = internalPhysicsWorldComponent;

      newRigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid)!;
        const { mass, shape } =
          PhysicsRigidBodyComponent.storage.get(rigidBodyEid)!;

        const geometry = (obj as Mesh).geometry;

        if (!geometry) {
          return;
        }

        let colShape: Ammo.btCollisionShape;

        if (geometry.type === "BoxGeometry") {
          geometry.computeBoundingBox();
          const boundingBoxSize = geometry.boundingBox!.getSize(new Vector3());
          const halfExtents = new ammo.btVector3(
            boundingBoxSize.x / 2,
            boundingBoxSize.y / 2,
            boundingBoxSize.z / 2
          );
          colShape = new ammo.btBoxShape(halfExtents);
        } else if (geometry.type === "SphereGeometry") {
          geometry.computeBoundingSphere();
          const radius = geometry.boundingSphere!.radius;
          colShape = new ammo.btSphereShape(radius);
        } else {
          throw new Error("Unimplemented");
        }

        const physScale = new ammo.btVector3(1, 1, 1);
        colShape.setLocalScaling(physScale);

        const localInertia = new ammo.btVector3(0, 0, 0);

        if (mass !== 0) {
          colShape.calculateLocalInertia(mass as number, localInertia);
        }

        obj.getWorldPosition(tempVec3);
        obj.getWorldQuaternion(tempQuat);
        const quat = new ammo.btQuaternion(
          tempQuat.x,
          tempQuat.y,
          tempQuat.z,
          tempQuat.w
        );
        const pos = new ammo.btVector3(tempVec3.x, tempVec3.y, tempVec3.z);
        const transform = new ammo.btTransform(quat, pos);
        const motionState = new ammo.btDefaultMotionState(transform);
        const constructionInfo = new ammo.btRigidBodyConstructionInfo(
          mass || 0,
          motionState,
          colShape,
          localInertia
        );
        const body = new ammo.btRigidBody(constructionInfo);

        dynamicsWorld!.addRigidBody(body);

        addMapComponent(
          world,
          InternalPhysicsRigidBodyComponent,
          rigidBodyEid,
          {
            body,
          }
        );
      });

      if (gravity && updateGravity) {
        gravityVec!.setValue(gravity!.x, gravity!.y, gravity!.z);
        dynamicsWorld!.setGravity(gravityVec!);
      }

      dynamicsWorld!.stepSimulation(world.dt, 2);

      rigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid);
        const { body } =
          InternalPhysicsRigidBodyComponent.storage.get(rigidBodyEid)!;

        const motionState = body!.getMotionState();

        if (motionState) {
          motionState.getWorldTransform(tempTransform);
          const position = tempTransform.getOrigin();
          const rotation = tempTransform.getRotation();
          obj!.position.set(position.x(), position.y(), position.z());
          obj!.quaternion.set(
            rotation.x(),
            rotation.y(),
            rotation.z(),
            rotation.w()
          );
        }
      });
    });
  });
}
