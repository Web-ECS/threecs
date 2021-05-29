var __defProp = Object.defineProperty;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __assign = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
import {d as defineComponent$1, b as addComponent$1, c as defineSystem$1, e as addEntity$1, f as Types$1, g as defineQuery$1, r as removeEntity$1, h as enterQuery$1, i as removeComponent$1, j as Vector2, k as createWorld, S as Scene, P as PerspectiveCamera, W as WebGLRenderer, C as Clock, p as pipe, l as MathUtils, m as rapier, V as Vector3, A as ArrowHelper, Q as Quaternion, O as Object3D, I as InstancedMesh, D as DynamicDrawUsage, M as Mesh} from "./vendor.8fbdb5f2.js";
const Types = Types$1;
const defineQuery = defineQuery$1;
const addEntity = addEntity$1;
const removeEntity = removeEntity$1;
const defineComponent = defineComponent$1;
const addComponent = addComponent$1;
const removeComponent = removeComponent$1;
const enterQuery = enterQuery$1;
const defineSystem = defineSystem$1;
function defineMapComponent() {
  const component = defineComponent({});
  component.storage = new Map();
  return component;
}
function addMapComponent(world, component, eid, value) {
  addComponent(world, component, eid);
  component.storage.set(eid, value);
}
function removeMapComponent(world, component, eid) {
  removeComponent(world, component, eid);
  component.storage.delete(eid);
}
function addObject3DComponent(world, eid, obj, parent) {
  if (parent) {
    parent.add(obj);
  }
  addMapComponent(world, Object3DComponent, eid, obj);
  world.objectEntityMap.set(obj, eid);
}
function addObject3DEntity(world, obj, parent) {
  const eid = addEntity(world);
  addObject3DComponent(world, eid, obj, parent);
  return eid;
}
function removeObject3DComponent(world, eid) {
  const obj = Object3DComponent.storage.get(eid);
  if (!obj) {
    return;
  }
  if (obj.parent) {
    obj.parent.remove(obj);
  }
  removeMapComponent(world, Object3DComponent, eid);
  world.objectEntityMap.delete(obj);
  obj.traverse((child) => {
    if (child === obj) {
      return;
    }
    const childEid = getObject3DEntity(world, child);
    if (childEid) {
      removeEntity(world, childEid);
      Object3DComponent.storage.delete(childEid);
      world.objectEntityMap.delete(child);
    }
  });
}
function removeObject3DEntity(world, eid) {
  removeObject3DComponent(world, eid);
  removeEntity(world, eid);
}
function getObject3DEntity(world, obj) {
  return world.objectEntityMap.get(obj);
}
function singletonQuery(query) {
  return (world) => {
    const entities = query(world);
    return entities.length > 0 ? entities[0] : void 0;
  };
}
const Object3DComponent = defineMapComponent();
const SceneComponent = defineComponent({});
const CameraComponent = defineComponent({});
const RendererComponent = defineMapComponent();
const rendererQuery = defineQuery([RendererComponent]);
const sceneQuery = defineQuery([Object3DComponent, SceneComponent]);
const mainSceneQuery = singletonQuery(sceneQuery);
const cameraQuery = defineQuery([Object3DComponent, CameraComponent]);
const RendererSystem = defineSystem(function RendererSystem2(world) {
  const renderers = rendererQuery(world);
  const scenes = sceneQuery(world);
  const cameras = cameraQuery(world);
  if (renderers.length > 0 && scenes.length > 0 && cameras.length > 0) {
    const rendererEid = renderers[0];
    const renderer = RendererComponent.storage.get(rendererEid);
    const sceneEid = scenes[0];
    const scene = Object3DComponent.storage.get(sceneEid);
    const cameraEid = cameras[0];
    const camera = Object3DComponent.storage.get(cameraEid);
    if (scene && camera) {
      if (world.resizeViewport) {
        const canvasParent = renderer.domElement.parentElement;
        if (camera.isPerspectiveCamera) {
          camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
          camera.updateProjectionMatrix();
        }
        renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight, false);
        world.resizeViewport = false;
      }
      renderer.render(scene, camera);
    }
  }
});
var ActionType;
(function(ActionType2) {
  ActionType2["Vector2"] = "Vector2";
  ActionType2["Button"] = "Button";
})(ActionType || (ActionType = {}));
var BindingType;
(function(BindingType2) {
  BindingType2["Axes"] = "Axes";
  BindingType2["Button"] = "Button";
  BindingType2["DirectionalButtons"] = "DirectionalButtons";
})(BindingType || (BindingType = {}));
const ActionTypesToBindings = {
  [ActionType.Button]: {
    create: () => ({pressed: false, released: false, held: false}),
    bindings: {
      [BindingType.Button]: (path, bindingDef, input, actions) => {
        const state = input.get(bindingDef.path);
        const value = actions.get(path);
        value.pressed = !value.held && !!state;
        value.released = value.held && !state;
        value.held = !!state;
      }
    }
  },
  [ActionType.Vector2]: {
    create: () => new Vector2(),
    bindings: {
      [BindingType.Axes]: (path, bindingDef, input, actions) => {
        const {x, y} = bindingDef;
        const value = actions.get(path);
        value.set(input.get(x) || 0, input.get(y) || 0);
      },
      [BindingType.DirectionalButtons]: (path, bindingDef, input, actions) => {
        const {up, down, left, right} = bindingDef;
        let x = 0;
        let y = 0;
        if (input.get(up)) {
          y += 1;
        }
        if (input.get(down)) {
          y -= 1;
        }
        if (input.get(left)) {
          x -= 1;
        }
        if (input.get(right)) {
          x += 1;
        }
        const value = actions.get(path);
        value.set(x, y);
      }
    }
  }
};
const ActionMappingSystem = defineSystem(function ActionMappingSystem2(world) {
  for (const actionMap of world.actionMaps) {
    for (const action of actionMap.actions) {
      if (!world.actions.has(action.path)) {
        world.actions.set(action.path, ActionTypesToBindings[action.type].create());
      }
      for (const binding of action.bindings) {
        ActionTypesToBindings[action.type].bindings[binding.type](action.path, binding, world.input, world.actions);
      }
    }
  }
});
function createThreeWorld(options = {}) {
  const {
    pointerLock,
    systems,
    afterRenderSystems,
    rendererParameters,
    actionMaps
  } = Object.assign({
    pointerLock: false,
    actionMaps: [],
    systems: [],
    afterRenderSystems: [],
    rendererParameters: {}
  }, options);
  const world = createWorld();
  world.dt = 0;
  world.time = 0;
  world.objectEntityMap = new Map();
  world.input = new Map();
  world.actionMaps = actionMaps || [];
  world.actions = new Map();
  world.resizeViewport = true;
  function onResize() {
    world.resizeViewport = true;
  }
  window.addEventListener("resize", onResize);
  const scene = new Scene();
  const sceneEid = addObject3DEntity(world, scene);
  addComponent(world, SceneComponent, sceneEid);
  const camera = new PerspectiveCamera();
  const cameraEid = addObject3DEntity(world, camera, scene);
  addComponent(world, CameraComponent, cameraEid);
  const rendererEid = addEntity(world);
  const renderer = new WebGLRenderer(__assign({
    antialias: true
  }, rendererParameters));
  renderer.setPixelRatio(window.devicePixelRatio);
  if (!rendererParameters.canvas) {
    document.body.appendChild(renderer.domElement);
  }
  const canvasParentStyle = renderer.domElement.parentElement.style;
  canvasParentStyle.position = "relative";
  const canvasStyle = renderer.domElement.style;
  canvasStyle.position = "absolute";
  canvasStyle.width = "100%";
  canvasStyle.height = "100%";
  addMapComponent(world, RendererComponent, rendererEid, renderer);
  if (pointerLock) {
    renderer.domElement.addEventListener("mousedown", () => {
      renderer.domElement.requestPointerLock();
    });
  }
  window.addEventListener("keydown", (e) => {
    world.input.set(`Keyboard/${e.code}`, 1);
  });
  window.addEventListener("keyup", (e) => {
    world.input.set(`Keyboard/${e.code}`, 0);
  });
  window.addEventListener("mousemove", (e) => {
    if (pointerLock && document.pointerLockElement === renderer.domElement) {
      world.input.set("Mouse/movementX", world.input.get("Mouse/movementX") + e.movementX);
      world.input.set("Mouse/movementY", world.input.get("Mouse/movementY") + e.movementY);
    }
  });
  window.addEventListener("blur", () => {
    for (const key of world.input.keys()) {
      world.input.set(key, 0);
    }
  });
  if (typeof window.__THREE_DEVTOOLS__ !== "undefined") {
    window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {detail: scene}));
    window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {detail: renderer}));
  }
  const clock = new Clock();
  const pipeline = pipe(ActionMappingSystem, ...systems, RendererSystem, ...afterRenderSystems);
  return {
    world,
    sceneEid,
    scene,
    cameraEid,
    camera,
    rendererEid,
    renderer,
    start() {
      renderer.setAnimationLoop(() => {
        world.dt = clock.getDelta();
        world.time = clock.getElapsedTime();
        pipeline(world);
        world.input.set("Mouse/movementX", 0);
        world.input.set("Mouse/movementY", 0);
      });
    }
  };
}
const DirectionalMovementActions = {
  Move: "DirectionalMovement/Move"
};
const DirectionalMovementComponent = defineComponent({
  speed: Types$1.f32
});
const directionalMovementQuery = defineQuery([
  DirectionalMovementComponent,
  Object3DComponent
]);
const DirectionalMovementSystem = defineSystem(function DirectionalMovementSystem2(world) {
  const moveVec = world.actions.get(DirectionalMovementActions.Move);
  const entities = directionalMovementQuery(world);
  entities.forEach((eid) => {
    const speed = DirectionalMovementComponent.speed[eid] || 0.2;
    const obj = Object3DComponent.storage.get(eid);
    obj.translateZ(-moveVec.y * speed);
    obj.translateX(moveVec.x * speed);
  });
});
const FirstPersonCameraActions = {
  Look: "FirstPersonCamera/Look"
};
const FirstPersonCameraPitchTarget = defineComponent({
  maxAngle: Types.f32,
  minAngle: Types.f32,
  sensitivity: Types.f32
});
const FirstPersonCameraYawTarget = defineComponent({
  sensitivity: Types.f32
});
const cameraPitchTargetQuery = defineQuery([
  FirstPersonCameraPitchTarget,
  Object3DComponent
]);
const cameraYawTargetQuery = defineQuery([
  FirstPersonCameraYawTarget,
  Object3DComponent
]);
const FirstPersonCameraSystem = defineSystem(function FirstPersonCameraSystem2(world) {
  const lookVec = world.actions.get(FirstPersonCameraActions.Look);
  const pitchEntities = cameraPitchTargetQuery(world);
  if (Math.abs(lookVec.y) > 1) {
    pitchEntities.forEach((eid) => {
      const obj = Object3DComponent.storage.get(eid);
      const sensitivity = FirstPersonCameraPitchTarget.sensitivity[eid];
      const maxAngle = FirstPersonCameraPitchTarget.maxAngle[eid];
      const minAngle = FirstPersonCameraPitchTarget.minAngle[eid];
      const maxAngleRads = MathUtils.degToRad(maxAngle || 89);
      const minAngleRads = MathUtils.degToRad(minAngle || -89);
      obj.rotation.x -= lookVec.y / (1e3 / (sensitivity || 1));
      if (obj.rotation.x > maxAngleRads) {
        obj.rotation.x = maxAngleRads;
      } else if (obj.rotation.x < minAngleRads) {
        obj.rotation.x = minAngleRads;
      }
    });
  }
  const yawEntities = cameraYawTargetQuery(world);
  if (Math.abs(lookVec.x) > 1) {
    yawEntities.forEach((eid) => {
      const obj = Object3DComponent.storage.get(eid);
      const sensitivity = FirstPersonCameraYawTarget.sensitivity[eid];
      obj.rotation.y -= lookVec.x / (1e3 / (sensitivity || 1));
    });
  }
});
const PhysicsWorldComponent = defineMapComponent();
function addPhysicsWorldComponent(world, eid, props = {}) {
  addMapComponent(world, PhysicsWorldComponent, eid, {
    gravity: props.gravity || new Vector3(0, -9.81, 0),
    debug: !!props.debug
  });
}
const physicsWorldQuery = defineQuery([PhysicsWorldComponent]);
const mainPhysicsWorldQuery = singletonQuery(physicsWorldQuery);
const newPhysicsWorldsQuery = enterQuery(physicsWorldQuery);
const InternalPhysicsWorldComponent = defineMapComponent();
var PhysicsColliderShape;
(function(PhysicsColliderShape2) {
  PhysicsColliderShape2["Box"] = "Box";
  PhysicsColliderShape2["Sphere"] = "Sphere";
  PhysicsColliderShape2["Capsule"] = "Capsule";
})(PhysicsColliderShape || (PhysicsColliderShape = {}));
const PhysicsBodyStatus = rapier.BodyStatus;
var PhysicsGroups;
(function(PhysicsGroups2) {
  PhysicsGroups2[PhysicsGroups2["None"] = 0] = "None";
  PhysicsGroups2[PhysicsGroups2["All"] = 65535] = "All";
})(PhysicsGroups || (PhysicsGroups = {}));
var PhysicsInteractionGroups;
(function(PhysicsInteractionGroups2) {
  PhysicsInteractionGroups2[PhysicsInteractionGroups2["None"] = 0] = "None";
  PhysicsInteractionGroups2[PhysicsInteractionGroups2["Default"] = 4294967295] = "Default";
})(PhysicsInteractionGroups || (PhysicsInteractionGroups = {}));
function createInteractionGroup(groups, mask) {
  return groups << 16 | mask;
}
const RigidBodyComponent = defineMapComponent();
function addRigidBodyComponent(world, eid, props = {}) {
  let defaultProps = {
    translation: props.translation || new Vector3(),
    rotation: props.rotation || new Quaternion(),
    shape: props.shape,
    bodyStatus: props.bodyStatus === void 0 ? rapier.BodyStatus.Static : props.bodyStatus,
    solverGroups: props.solverGroups === void 0 ? 4294967295 : props.solverGroups,
    collisionGroups: props.collisionGroups === void 0 ? 4294967295 : props.collisionGroups,
    lockRotations: !!props.lockRotations,
    friction: props.friction === void 0 ? 0.5 : props.friction
  };
  if (props.shape === PhysicsColliderShape.Capsule) {
    const capsuleProps = props;
    const defaultCapsuleProps = defaultProps;
    defaultCapsuleProps.halfHeight = capsuleProps.halfHeight === void 0 ? 0.5 : capsuleProps.halfHeight;
    defaultCapsuleProps.radius = capsuleProps.radius === void 0 ? 0.5 : capsuleProps.radius;
  }
  addMapComponent(world, RigidBodyComponent, eid, defaultProps);
}
const rigidBodiesQuery = defineQuery([
  RigidBodyComponent,
  Object3DComponent
]);
const newRigidBodiesQuery = enterQuery(rigidBodiesQuery);
const InternalRigidBodyComponent = defineMapComponent();
const PhysicsRaycasterComponent = defineMapComponent();
function addPhysicsRaycasterComponent(world, eid, props = {}) {
  const useObject3DTransform = props.useObject3DTransform === void 0 ? true : props.useObject3DTransform;
  let transformNeedsUpdate = props.transformNeedsUpdate;
  let transformAutoUpdate = props.transformAutoUpdate;
  if (useObject3DTransform && transformAutoUpdate === void 0) {
    transformAutoUpdate = true;
    transformNeedsUpdate = true;
  } else if (transformNeedsUpdate === void 0) {
    transformNeedsUpdate = true;
  }
  if (transformAutoUpdate === void 0) {
    transformAutoUpdate = false;
  }
  addMapComponent(world, PhysicsRaycasterComponent, eid, {
    useObject3DTransform,
    transformNeedsUpdate,
    transformAutoUpdate,
    withIntersection: !!props.withIntersection,
    withNormal: !!props.withNormal,
    origin: props.origin || new Vector3(0, 0, 0),
    dir: props.dir || new Vector3(0, 0, -1),
    intersection: new Vector3(),
    normal: new Vector3(),
    maxToi: props.maxToi === void 0 ? Number.MAX_VALUE : props.maxToi,
    groups: props.groups === void 0 ? 4294967295 : props.groups,
    debug: !!props.debug
  });
}
const physicsRaycasterQuery = defineQuery([PhysicsRaycasterComponent]);
const newPhysicsRaycastersQuery = enterQuery(physicsRaycasterQuery);
const InternalPhysicsRaycasterComponent = defineMapComponent();
async function loadPhysicsSystem() {
  await rapier.init();
  const tempVec3 = new Vector3();
  const tempQuat = new Quaternion();
  return defineSystem(function PhysicsSystem(world) {
    const physicsWorldEid = mainPhysicsWorldQuery(world);
    const newPhysicsWorldEntities = newPhysicsWorldsQuery(world);
    const rigidBodyEntities = rigidBodiesQuery(world);
    const newRigidBodyEntities = newRigidBodiesQuery(world);
    const physicsRaycasterEntities = physicsRaycasterQuery(world);
    const newPhysicsRaycasterEntities = newPhysicsRaycastersQuery(world);
    const sceneEid = mainSceneQuery(world);
    newPhysicsWorldEntities.forEach((eid) => {
      const physicsWorldComponent = PhysicsWorldComponent.storage.get(eid);
      addMapComponent(world, InternalPhysicsWorldComponent, eid, {
        physicsWorld: new rapier.World(physicsWorldComponent.gravity),
        colliderHandleToEntityMap: new Map()
      });
    });
    if (physicsWorldEid === void 0) {
      return;
    }
    const internalPhysicsWorldComponent = InternalPhysicsWorldComponent.storage.get(physicsWorldEid);
    const {physicsWorld, colliderHandleToEntityMap} = internalPhysicsWorldComponent;
    newRigidBodyEntities.forEach((rigidBodyEid) => {
      const obj = Object3DComponent.storage.get(rigidBodyEid);
      const rigidBodyProps = RigidBodyComponent.storage.get(rigidBodyEid);
      const geometry = obj.geometry;
      if (!geometry && !rigidBodyProps.shape) {
        return;
      }
      obj.getWorldPosition(tempVec3);
      obj.getWorldQuaternion(tempQuat);
      const rigidBodyDesc = new rapier.RigidBodyDesc(rigidBodyProps.bodyStatus);
      rigidBodyDesc.setRotation(tempQuat.clone());
      rigidBodyDesc.setTranslation(tempVec3.x, tempVec3.y, tempVec3.z);
      if (rigidBodyProps.lockRotations) {
        rigidBodyDesc.lockRotations();
      }
      const body = physicsWorld.createRigidBody(rigidBodyDesc);
      let colliderShape;
      const geometryType = geometry && geometry.type;
      if (geometryType === "BoxGeometry") {
        geometry.computeBoundingBox();
        const boundingBoxSize = geometry.boundingBox.getSize(new Vector3());
        colliderShape = new rapier.Cuboid(boundingBoxSize.x / 2, boundingBoxSize.y / 2, boundingBoxSize.z / 2);
      } else if (geometryType === "SphereGeometry") {
        geometry.computeBoundingSphere();
        const radius = geometry.boundingSphere.radius;
        colliderShape = new rapier.Ball(radius);
      } else if (rigidBodyProps.shape === PhysicsColliderShape.Capsule) {
        const {radius, halfHeight} = rigidBodyProps;
        colliderShape = new rapier.Capsule(halfHeight, radius);
      } else {
        throw new Error("Unimplemented");
      }
      const colliderDesc = new rapier.ColliderDesc(colliderShape);
      const translation = rigidBodyProps.translation;
      colliderDesc.setTranslation(translation.x, translation.y, translation.z);
      colliderDesc.setRotation(rigidBodyProps.rotation);
      colliderDesc.setCollisionGroups(rigidBodyProps.collisionGroups);
      colliderDesc.setSolverGroups(rigidBodyProps.solverGroups);
      colliderDesc.setFriction(rigidBodyProps.friction);
      const collider = physicsWorld.createCollider(colliderDesc, body.handle);
      colliderHandleToEntityMap.set(collider.handle, rigidBodyEid);
      addMapComponent(world, InternalRigidBodyComponent, rigidBodyEid, {
        body,
        colliderShape
      });
    });
    newPhysicsRaycasterEntities.forEach((raycasterEid) => {
      const raycaster = PhysicsRaycasterComponent.storage.get(raycasterEid);
      InternalPhysicsRaycasterComponent.storage.set(raycasterEid, {
        ray: new rapier.Ray(raycaster.origin, raycaster.dir)
      });
    });
    physicsWorld.step();
    physicsRaycasterEntities.forEach((rayCasterEid) => {
      const raycaster = PhysicsRaycasterComponent.storage.get(rayCasterEid);
      const obj = Object3DComponent.storage.get(rayCasterEid);
      if (raycaster.useObject3DTransform && obj && (raycaster.transformNeedsUpdate || raycaster.transformAutoUpdate)) {
        obj.getWorldPosition(raycaster.origin);
        obj.getWorldDirection(raycaster.dir);
        if (!raycaster.transformAutoUpdate) {
          raycaster.transformNeedsUpdate = false;
        }
      }
      const internalRaycaster = InternalPhysicsRaycasterComponent.storage.get(rayCasterEid);
      const colliderSet = physicsWorld.colliders;
      let intersection;
      if (raycaster.withNormal) {
        intersection = physicsWorld.queryPipeline.castRayAndGetNormal(colliderSet, internalRaycaster.ray, raycaster.maxToi, true, raycaster.groups);
        if (intersection) {
          raycaster.normal.copy(intersection.normal);
        } else {
          raycaster.normal.set(0, 0, 0);
        }
      } else {
        intersection = physicsWorld.queryPipeline.castRay(colliderSet, internalRaycaster.ray, raycaster.maxToi, true, raycaster.groups);
      }
      if (intersection) {
        raycaster.colliderEid = colliderHandleToEntityMap.get(intersection.colliderHandle);
        raycaster.toi = intersection.toi;
      } else {
        raycaster.colliderEid = void 0;
        raycaster.toi = void 0;
      }
      if (raycaster.withIntersection) {
        if (raycaster.toi !== void 0) {
          raycaster.intersection.addVectors(raycaster.origin, raycaster.dir).multiplyScalar(raycaster.toi);
        } else {
          raycaster.intersection.set(0, 0, 0);
        }
      }
      if (sceneEid === void 0) {
        return;
      }
      if (raycaster.debug) {
        if (!internalRaycaster.arrowHelper) {
          internalRaycaster.arrowHelper = new ArrowHelper(raycaster.dir, raycaster.origin, raycaster.toi, 16776960, 0.2, 0.1);
          const scene = Object3DComponent.storage.get(sceneEid);
          scene.add(internalRaycaster.arrowHelper);
        } else {
          const arrowHelper = internalRaycaster.arrowHelper;
          arrowHelper.position.copy(raycaster.origin);
          arrowHelper.setDirection(raycaster.dir);
          arrowHelper.setLength(raycaster.toi || 0, 0.2, 0.1);
        }
      } else if (!raycaster.debug && internalRaycaster.arrowHelper) {
        const scene = Object3DComponent.storage.get(sceneEid);
        scene.remove(internalRaycaster.arrowHelper);
        internalRaycaster.arrowHelper = void 0;
      }
    });
    rigidBodyEntities.forEach((rigidBodyEid) => {
      const obj = Object3DComponent.storage.get(rigidBodyEid);
      const {lockRotations} = RigidBodyComponent.storage.get(rigidBodyEid);
      const {body} = InternalRigidBodyComponent.storage.get(rigidBodyEid);
      if (body.isDynamic()) {
        const translation = body.translation();
        const rotation = body.rotation();
        obj.position.set(translation.x, translation.y, translation.z);
        if (!lockRotations) {
          obj.quaternion.copy(rotation);
        }
      } else if (body.isKinematic()) {
        body.setNextKinematicTranslation(obj.position);
        body.setNextKinematicRotation(obj.quaternion);
      }
    });
  });
}
const CharacterPhysicsGroup = 1;
const CharacterInteractionGroup = createInteractionGroup(CharacterPhysicsGroup, PhysicsGroups.All);
const CharacterShapecastInteractionGroup = createInteractionGroup(PhysicsGroups.All, ~CharacterPhysicsGroup);
function physicsCharacterControllerAction(key) {
  return "PhysicsCharacterController/" + key;
}
const PhysicsCharacterControllerActions = {
  Move: physicsCharacterControllerAction("Move"),
  Jump: physicsCharacterControllerAction("Jump"),
  Sprint: physicsCharacterControllerAction("Sprint"),
  Crouch: physicsCharacterControllerAction("Crouch")
};
const PhysicsCharacterControllerComponent = defineMapComponent();
function addPhysicsCharacterControllerComponent(world, eid, props = {}) {
  addMapComponent(world, PhysicsCharacterControllerComponent, eid, Object.assign({
    walkSpeed: 1750,
    drag: 250,
    maxWalkSpeed: 18,
    jumpForce: 750,
    inAirModifier: 0.5,
    inAirDrag: 100,
    crouchModifier: 0.7,
    crouchJumpModifier: 1.5,
    minSlideSpeed: 3,
    slideModifier: 50,
    slideDrag: 150,
    slideCooldown: 1,
    sprintModifier: 1.8,
    maxSprintSpeed: 25
  }, props));
}
const InternalPhysicsCharacterControllerComponent = defineMapComponent();
function addPhysicsCharacterControllerEntity(world, scene, props) {
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
    lockRotations: true
  });
  return [playerRigEid, playerRig];
}
const physicsCharacterControllerQuery = defineQuery([
  PhysicsCharacterControllerComponent,
  InternalRigidBodyComponent,
  Object3DComponent
]);
const physicsCharacterControllerAddedQuery = enterQuery(physicsCharacterControllerQuery);
const PhysicsCharacterControllerSystem = defineSystem(function PhysicsCharacterControllerSystem2(world) {
  const physicsWorldEid = mainPhysicsWorldQuery(world);
  const entities = physicsCharacterControllerQuery(world);
  const addedEntities = physicsCharacterControllerAddedQuery(world);
  addedEntities.forEach((eid) => {
    addMapComponent(world, InternalPhysicsCharacterControllerComponent, eid, {
      moveForce: new Vector3(),
      dragForce: new Vector3(),
      linearVelocity: new Vector3(),
      shapeCastPosition: new Vector3(),
      shapeCastRotation: new Quaternion(),
      isSliding: false,
      slideForce: new Vector3(),
      lastSlideTime: 0
    });
  });
  if (physicsWorldEid === void 0) {
    return;
  }
  const internalPhysicsWorldComponent = InternalPhysicsWorldComponent.storage.get(physicsWorldEid);
  if (!internalPhysicsWorldComponent) {
    return;
  }
  const physicsWorld = internalPhysicsWorldComponent.physicsWorld;
  const moveVec = world.actions.get(PhysicsCharacterControllerActions.Move);
  const jump = world.actions.get(PhysicsCharacterControllerActions.Jump);
  const crouch = world.actions.get(PhysicsCharacterControllerActions.Crouch);
  const sprint = world.actions.get(PhysicsCharacterControllerActions.Sprint);
  entities.forEach((eid) => {
    const {
      walkSpeed,
      drag,
      inAirModifier,
      inAirDrag,
      crouchModifier,
      maxWalkSpeed,
      jumpForce,
      crouchJumpModifier,
      slideModifier,
      slideDrag,
      slideCooldown,
      minSlideSpeed,
      sprintModifier,
      maxSprintSpeed
    } = PhysicsCharacterControllerComponent.storage.get(eid);
    const internalPhysicsCharacterController = InternalPhysicsCharacterControllerComponent.storage.get(eid);
    const {
      moveForce,
      dragForce,
      linearVelocity,
      shapeCastPosition,
      shapeCastRotation,
      isSliding,
      slideForce,
      lastSlideTime
    } = internalPhysicsCharacterController;
    const obj = Object3DComponent.storage.get(eid);
    const {
      translation: shapeTranslationOffset,
      rotation: shapeRotationOffset
    } = RigidBodyComponent.storage.get(eid);
    const {body, colliderShape} = InternalRigidBodyComponent.storage.get(eid);
    body.setRotation(obj.quaternion, true);
    linearVelocity.copy(body.linvel());
    shapeCastPosition.copy(obj.position).add(shapeTranslationOffset);
    shapeCastRotation.copy(obj.quaternion).multiply(shapeRotationOffset);
    const shapeCastResult = physicsWorld.castShape(physicsWorld.colliders, shapeCastPosition, shapeCastRotation, physicsWorld.gravity, colliderShape, world.dt, CharacterShapecastInteractionGroup);
    const isGrounded = !!shapeCastResult;
    const isSprinting = isGrounded && sprint.held && !isSliding;
    const speed = linearVelocity.length();
    const maxSpeed = isSprinting ? maxSprintSpeed : maxWalkSpeed;
    if (speed < maxSpeed) {
      moveForce.set(moveVec.x, 0, -moveVec.y).normalize().applyQuaternion(obj.quaternion).multiplyScalar(walkSpeed * world.dt);
      if (!isGrounded) {
        moveForce.multiplyScalar(inAirModifier);
      } else if (isGrounded && crouch.held && !isSliding) {
        moveForce.multiplyScalar(crouchModifier);
      } else if (isGrounded && sprint.held && !isSliding) {
        moveForce.multiplyScalar(sprintModifier);
      }
    }
    moveForce.add(physicsWorld.gravity);
    if (crouch.pressed && speed > minSlideSpeed && isGrounded && !isSliding && world.time > lastSlideTime + slideCooldown) {
      slideForce.set(0, 0, (speed + 1) * -slideModifier).applyQuaternion(obj.quaternion);
      moveForce.add(slideForce);
      internalPhysicsCharacterController.isSliding = true;
      internalPhysicsCharacterController.lastSlideTime = world.time;
    } else if (crouch.released || world.time > lastSlideTime + slideCooldown) {
      internalPhysicsCharacterController.isSliding = false;
    }
    if (speed !== 0) {
      let dragMultiplier = drag;
      if (isSliding) {
        dragMultiplier = slideDrag;
      } else if (!isGrounded) {
        dragMultiplier = inAirDrag;
      }
      dragForce.copy(linearVelocity).negate().multiplyScalar(dragMultiplier * world.dt);
      moveForce.add(dragForce);
    }
    if (jump.pressed && isGrounded) {
      const jumpModifier = crouch.held ? crouchJumpModifier : 1;
      moveForce.y += jumpForce * jumpModifier;
    }
    body.applyForce(moveForce, true);
  });
});
class InstancedMeshImposter extends Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    this.visible = false;
  }
}
class InstancedMeshRenderer extends InstancedMesh {
  constructor(geometry, material, maxInstances = 100) {
    super(geometry, material, maxInstances);
    this.instanceMatrix.setUsage(DynamicDrawUsage);
    this.isInstancedMeshRenderer = true;
    this.instances = [];
  }
  createInstance() {
    const mesh = new InstancedMeshImposter(this.geometry, this.material);
    this.instances.push(mesh);
    return mesh;
  }
  removeInstance(mesh) {
    const idx = this.instances.indexOf(mesh);
    if (idx === -1) {
      return false;
    }
    this.instances.splice(idx, 1);
    return true;
  }
  update() {
    this.count = this.instances.length;
    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      instance.updateMatrixWorld();
      this.setMatrixAt(i, instance.matrixWorld);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}
const InstancedMeshRendererComponent = defineComponent({});
function addInstancedMeshRendererEntity(world, geometry, material, maxInstances = 100, parent) {
  const instancedMeshRenderer = new InstancedMeshRenderer(geometry, material, maxInstances);
  const instancedMeshRendererEid = addObject3DEntity(world, instancedMeshRenderer, parent);
  addComponent(world, InstancedMeshRendererComponent, instancedMeshRendererEid);
  return [instancedMeshRendererEid, instancedMeshRenderer];
}
function addInstancedMeshImposterEntity(world, instancedMeshRenderer, parent) {
  const obj = instancedMeshRenderer.createInstance();
  const eid = addObject3DEntity(world, obj, parent);
  return [eid, obj];
}
const instancedMeshRendererQuery = defineQuery([
  InstancedMeshRendererComponent,
  Object3DComponent
]);
const InstancedMeshRendererSystem = defineSystem(function InstancedMeshRendererSystem2(world) {
  const entities = instancedMeshRendererQuery(world);
  entities.forEach((eid) => {
    const obj = Object3DComponent.storage.get(eid);
    if (!obj.isInstancedMeshRenderer) {
      return;
    }
    obj.update();
  });
});
var crateTextureUrl = "/threecs/assets/crate.a890f0a8.gif";
export {ActionType as A, BindingType as B, DirectionalMovementSystem as D, FirstPersonCameraSystem as F, InstancedMeshRendererSystem as I, Object3DComponent as O, PhysicsCharacterControllerActions as P, Types as T, defineSystem as a, defineComponent as b, createThreeWorld as c, defineMapComponent as d, crateTextureUrl as e, addObject3DEntity as f, addMapComponent as g, addComponent as h, defineQuery as i, PhysicsCharacterControllerSystem as j, FirstPersonCameraActions as k, loadPhysicsSystem as l, addPhysicsWorldComponent as m, addPhysicsCharacterControllerEntity as n, addRigidBodyComponent as o, PhysicsBodyStatus as p, FirstPersonCameraYawTarget as q, removeObject3DEntity as r, singletonQuery as s, FirstPersonCameraPitchTarget as t, addInstancedMeshRendererEntity as u, addInstancedMeshImposterEntity as v, DirectionalMovementActions as w, addPhysicsRaycasterComponent as x, DirectionalMovementComponent as y};
