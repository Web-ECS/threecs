import Ammo from "ammo-wasm";
import * as Rapier from "@dimforge/rapier3d-compat";
import { Vector3, Mesh, Quaternion } from "three";
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

interface PhysicsRigidBodyProps {
  mass?: number;
  shape?: "auto";
}

export const PhysicsRigidBodyComponent =
  defineMapComponent<PhysicsRigidBodyProps>();

const physicsWorldQuery = defineQuery([PhysicsWorldComponent]);
const newPhysicsWorldsQuery = enterQuery(physicsWorldQuery);

const rigidBodiesQuery = defineQuery([
  PhysicsRigidBodyComponent,
  Object3DComponent,
]);
const newRigidBodiesQuery = enterQuery(rigidBodiesQuery);

interface AmmoPhysicsWorldProps {
  dynamicsWorld?: Ammo.btDiscreteDynamicsWorld;
  gravityVec?: Ammo.btVector3;
}

const AmmoPhysicsWorldComponent = defineMapComponent<AmmoPhysicsWorldProps>();
interface AmmoPhysicsRigidBodyProps {
  body?: Ammo.btRigidBody;
}

const AmmoPhysicsRigidBodyComponent =
  defineMapComponent<AmmoPhysicsRigidBodyProps>();

interface AmmoOptions {
  wasmUrl?: string;
}

export async function loadAmmoPhysicsSystem(
  options: AmmoOptions
): Promise<System> {
  const ammo = await Ammo({
    locateFile(url: string, scriptDirectory: string) {
      console.log(url, scriptDirectory);
      if (url.endsWith(".wasm") && options.wasmUrl) {
        return options.wasmUrl;
      }

      return url;
    },
  });

  const tempTransform = new ammo.btTransform();
  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();

  return defineSystem(function AmmoPhysicsSystem(world: World) {
    const physicsWorldEntities = physicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);

    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(eid)!;
      AmmoPhysicsWorldComponent.storage.get(eid)!;

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

      addMapComponent(world, AmmoPhysicsWorldComponent, eid, {
        gravityVec,
        dynamicsWorld,
      });
    });

    physicsWorldEntities.forEach((physicsWorldEid) => {
      const physicsWorldComponent =
        PhysicsWorldComponent.storage.get(physicsWorldEid)!;
      const ammoPhysicsWorldComponent =
        AmmoPhysicsWorldComponent.storage.get(physicsWorldEid)!;

      const { gravity, updateGravity } = physicsWorldComponent;
      const { gravityVec, dynamicsWorld } = ammoPhysicsWorldComponent;

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

        addMapComponent(world, AmmoPhysicsRigidBodyComponent, rigidBodyEid, {
          body,
        });
      });

      if (gravity && updateGravity) {
        gravityVec!.setValue(gravity!.x, gravity!.y, gravity!.z);
        dynamicsWorld!.setGravity(gravityVec!);
        physicsWorldComponent.updateGravity = false;
      }

      dynamicsWorld!.stepSimulation(world.dt, 2);

      rigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid);
        const { body } =
          AmmoPhysicsRigidBodyComponent.storage.get(rigidBodyEid)!;

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

interface RapierPhysicsWorldProps {
  rapierWorld?: Rapier.World;
  gravityVec?: Rapier.Vector3;
}

const RapierPhysicsWorldComponent =
  defineMapComponent<RapierPhysicsWorldProps>();
interface RapierPhysicsRigidBodyProps {
  body?: Rapier.RigidBody;
}

const RapierPhysicsRigidBodyComponent =
  defineMapComponent<RapierPhysicsRigidBodyProps>();

export async function loadRapierPhysicsSystem(): Promise<System> {
  await Rapier.init();

  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();

  return defineSystem(function RapierPhysicsSystem(world: World) {
    const physicsWorldEntities = physicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);

    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(eid)!;
      RapierPhysicsWorldComponent.storage.get(eid)!;

      let gravityVec: Rapier.Vector3;

      const gravityConfig = physicsWorldComponent.gravity;

      if (gravityConfig) {
        gravityVec = new Rapier.Vector3(
          gravityConfig.x,
          gravityConfig.y,
          gravityConfig.z
        );
      } else {
        gravityVec = new Rapier.Vector3(0, -9.8, 0);
      }

      const rapierWorld = new Rapier.World(gravityVec);

      addMapComponent(world, RapierPhysicsWorldComponent, eid, {
        gravityVec,
        rapierWorld,
      });
    });

    physicsWorldEntities.forEach((physicsWorldEid) => {
      const physicsWorldComponent =
        PhysicsWorldComponent.storage.get(physicsWorldEid)!;
      const ammoPhysicsWorldComponent =
        RapierPhysicsWorldComponent.storage.get(physicsWorldEid)!;

      const { gravity, updateGravity } = physicsWorldComponent;
      const { gravityVec, rapierWorld } = ammoPhysicsWorldComponent;

      newRigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid)!;
        const { mass, shape } =
          PhysicsRigidBodyComponent.storage.get(rigidBodyEid)!;

        const geometry = (obj as Mesh).geometry;

        if (!geometry) {
          return;
        }

        obj.getWorldPosition(tempVec3);
        obj.getWorldQuaternion(tempQuat);

        const rigidBodyDesc = new Rapier.RigidBodyDesc(
          mass === 0 ? Rapier.BodyStatus.Static : Rapier.BodyStatus.Dynamic
        );

        rigidBodyDesc.setRotation(
          new Rapier.Quaternion(tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w)
        );
        rigidBodyDesc.setTranslation(tempVec3.x, tempVec3.y, tempVec3.z);

        const body = rapierWorld!.createRigidBody(rigidBodyDesc);

        let colliderDesc: Rapier.ColliderDesc;

        if (geometry.type === "BoxGeometry") {
          geometry.computeBoundingBox();
          const boundingBoxSize = geometry.boundingBox!.getSize(new Vector3());
          colliderDesc = Rapier.ColliderDesc.cuboid(
            boundingBoxSize.x / 2,
            boundingBoxSize.y / 2,
            boundingBoxSize.z / 2
          );
        } else if (geometry.type === "SphereGeometry") {
          geometry.computeBoundingSphere();
          const radius = geometry.boundingSphere!.radius;
          colliderDesc = Rapier.ColliderDesc.ball(radius);
        } else {
          throw new Error("Unimplemented");
        }

        // TODO: Handle mass / density
        // TODO: Handle scale
        // TODO: Handle dynamic gravity

        rapierWorld!.createCollider(colliderDesc, body.handle);

        addMapComponent(world, RapierPhysicsRigidBodyComponent, rigidBodyEid, {
          body,
        });
      });

      if (gravity && updateGravity) {
        rapierWorld!.gravity.x = gravity!.x;
        rapierWorld!.gravity.y = gravity!.y;
        rapierWorld!.gravity.z = gravity!.z;
        physicsWorldComponent.updateGravity = false;
      }

      rapierWorld!.step();

      rigidBodyEntities.forEach((rigidBodyEid) => {
        const obj = Object3DComponent.storage.get(rigidBodyEid);
        const { body } =
          RapierPhysicsRigidBodyComponent.storage.get(rigidBodyEid)!;

        if (body!.isDynamic()) {
          const translation = body!.translation();
          const rotation = body!.rotation();
          obj!.position.set(translation.x, translation.y, translation.z);
          obj!.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        }
      });
    });
  });
}
