import "../styles.16b1c26f.js";
import {d as defineSystem, T as TextureLoader, M as Mesh, B as BoxGeometry, b as MeshBasicMaterial, V as Vector3, f as defineQuery} from "../vendor.d9824b0b.js";
import {d as defineMapComponent, c as createThreeWorld, a as crateTextureUrl, b as addObject3DEntity, e as addMapComponent, O as Object3DComponent} from "../crate.b033f791.js";
const RotateComponent = defineMapComponent();
const rotateQuery = defineQuery([RotateComponent, Object3DComponent]);
const RotateSystem = defineSystem((world2) => {
  const entities = rotateQuery(world2);
  entities.forEach((eid) => {
    const dt = world2.dt;
    const object3D = Object3DComponent.storage.get(eid);
    const {speed, axis} = RotateComponent.storage.get(eid);
    object3D.rotateOnAxis(axis, speed * dt);
  });
});
const {world, scene, camera, start} = createThreeWorld({
  beforeRenderSystems: [RotateSystem],
  components: [RotateComponent]
});
camera.position.z = 5;
const crateTexture = new TextureLoader().load(crateTextureUrl);
const cube = new Mesh(new BoxGeometry(), new MeshBasicMaterial({map: crateTexture}));
const cubeEid = addObject3DEntity(world, cube, scene);
addMapComponent(world, RotateComponent, cubeEid, {
  axis: new Vector3(0.5, 1, 0).normalize(),
  speed: 1
});
start();
