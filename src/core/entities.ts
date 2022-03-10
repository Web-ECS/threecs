import { addComponent, addEntity, defineComponent, Types } from "bitecs";
import { 
  BufferGeometry,
  Material,
  Mesh,
  Object3D,
  Scene,
  Bone,
  PerspectiveCamera,
  Group,
  InstancedMesh,
  Line,
  LineLoop,
  LineSegments,
  PointLight,
  Points,
  SkinnedMesh,
  SpotLight,
  OrthographicCamera,
  BoxGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
  IcosahedronGeometry,
  LatheGeometry,
  OctahedronGeometry,
  PlaneGeometry,
  PolyhedronGeometry,
  RingGeometry,
  ShapeGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  TubeGeometry,
  WireframeGeometry,
  LineBasicMaterial,
  LineDashedMaterial,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  PointsMaterial,
  RawShaderMaterial,
  ShaderMaterial,
  ShadowMaterial,
  SpriteMaterial,
  CanvasTexture,
  CompressedTexture,
  CubeTexture,
  DataTexture,
  DataTexture2DArray,
  DataTexture3D,
  DepthTexture,
  Texture,
  VideoTexture,
  DynamicDrawUsage,
  Audio,
  PositionalAudio,
  AudioListener,
} from "three";
import { defineMapComponent } from "./ECS";
import { Constructor, IObject3DEntity, IObject3DStaticProps, Object3DEntityMixin } from "./proxy/Object3DEntityMixin";
import { World } from "./World";

type Override<T, O> = Omit<T, keyof O> & O;

type ITextureProps = {
  eid: number
  store: typeof TextureComponent;
}

export type ITextureEntity<T extends Texture = Texture> = Override<T, ITextureProps>;

export const TextureComponent = defineMapComponent<ITextureEntity>();

export const TextureEntityMixin = <T extends Texture, R extends ITextureEntity<T>>(Base: Constructor<T>): Constructor<R> => {
  const TypedBase = Base as any;

  const ReturnType = class extends TypedBase {
    eid: number;
    store: typeof TextureComponent;
    constructor(world: World, ...args: ConstructorParameters<typeof TypedBase>) {
      super(...args);
      this.store = TextureComponent;
      const eid = this.eid = addEntity(world);
      addComponent(world, this.store, eid);
      this.store.store.set(eid, this as unknown as ITextureEntity);
    }
  }

  return ReturnType as unknown as Constructor<R>;
}

export class TextureEntity extends TextureEntityMixin(Texture) {
  constructor(world: World, ...args: ConstructorParameters<typeof Texture>) {
    super(world, ...args);
  }
}

export const CanvasTextureComponent = defineComponent();

export class CanvasTextureEntity extends TextureEntityMixin(CanvasTexture) {
  constructor(world: World, ...args: ConstructorParameters<typeof CanvasTexture>) {
    super(world, ...args);
    addComponent(world, CanvasTextureComponent, this.eid);
  }
}

export const CompressedTextureComponent = defineComponent();

export class CompressedTextureEntity extends TextureEntityMixin(CompressedTexture) {
  constructor(world: World, ...args: ConstructorParameters<typeof CompressedTexture>) {
    super(world, ...args);
    addComponent(world, CompressedTextureComponent, this.eid);
  }
}

export const CubeTextureComponent = defineComponent();

export class CubeTextureEntity extends TextureEntityMixin(CubeTexture) {
  constructor(world: World, ...args: ConstructorParameters<typeof CubeTexture>) {
    super(world, ...args);
    addComponent(world, CubeTextureComponent, this.eid);
  }
}

export const DataTextureComponent = defineComponent();

export class DataTextureEntity extends TextureEntityMixin(DataTexture) {
  constructor(world: World, ...args: ConstructorParameters<typeof DataTexture>) {
    super(world, ...args);
    addComponent(world, DataTextureComponent, this.eid);
  }
}

export const DataTexture2DArrayComponent = defineComponent();

export class DataTexture2DArrayEntity extends TextureEntityMixin(DataTexture2DArray) {
  constructor(world: World, ...args: ConstructorParameters<typeof DataTexture2DArray>) {
    super(world, ...args);
    addComponent(world, DataTexture2DArrayComponent, this.eid);
  }
}

export const DataTexture3DComponent = defineComponent();

export class DataTexture3DEntity extends TextureEntityMixin(DataTexture3D) {
  constructor(world: World, ...args: ConstructorParameters<typeof DataTexture3D>) {
    super(world, ...args);
    addComponent(world, DataTexture3DComponent, this.eid);
  }
}

export const DepthTextureComponent = defineComponent();

export class DepthTextureEntity extends TextureEntityMixin(DepthTexture) {
  constructor(world: World, ...args: ConstructorParameters<typeof DepthTexture>) {
    super(world, ...args);
    addComponent(world, DepthTextureComponent, this.eid);
  }
}

export const VideoTextureComponent = defineComponent();

export class VideoTextureEntity extends TextureEntityMixin(VideoTexture) {
  constructor(world: World, ...args: ConstructorParameters<typeof VideoTexture>) {
    super(world, ...args);
    addComponent(world, VideoTextureComponent, this.eid);
  }
}

export const GeometryComponent = defineMapComponent<IGeometryEntity>();

type IGeometryProps = {
  eid: number
  store: typeof GeometryComponent;
}

export type IGeometryEntity<T extends BufferGeometry = BufferGeometry> = Override<T, IGeometryProps>;

export const GeometryEntityMixin = <T extends BufferGeometry, R extends IGeometryEntity<T>>(Base: Constructor<T>): Constructor<R> => {
  const TypedBase = Base as any;

  const ReturnType = class extends TypedBase {
    eid: number;
    store: typeof GeometryComponent;
    constructor(world: World, ...args: ConstructorParameters<typeof TypedBase>) {
      super(...args);
      this.store = GeometryComponent;
      const eid = this.eid = addEntity(world);
      addComponent(world, this.store, eid);
      this.store.store.set(eid, this as unknown as IGeometryEntity);
    }
  }

  return ReturnType as unknown as Constructor<R>;
}

export const BoxGeometryComponent = defineComponent();

export class BoxGeometryEntity extends GeometryEntityMixin(BoxGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof BoxGeometry>) {
    super(world, ...args);
    addComponent(world, BoxGeometryComponent, this.eid);
  }
}

export const CircleGeometryComponent = defineComponent();

export class CircleGeometryEntity extends GeometryEntityMixin(CircleGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof CircleGeometry>) {
    super(world, ...args);
    addComponent(world, CircleGeometryComponent, this.eid);
  }
}


export const ConeGeometryComponent = defineComponent();

export class ConeGeometryEntity extends GeometryEntityMixin(ConeGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof ConeGeometry>) {
    super(world, ...args);
    addComponent(world, ConeGeometryComponent, this.eid);
  }
}

export const CylinderGeometryComponent = defineComponent();

export class CylinderGeometryEntity extends GeometryEntityMixin(CylinderGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof CylinderGeometry>) {
    super(world, ...args);
    addComponent(world, CylinderGeometryComponent, this.eid);
  }
}

export const DodecahedronGeometryComponent = defineComponent();

export class DodecahedronGeometryEntity extends GeometryEntityMixin(DodecahedronGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof DodecahedronGeometry>) {
    super(world, ...args);
    addComponent(world, DodecahedronGeometryComponent, this.eid);
  }
}

export const EdgesGeometryComponent = defineComponent();

export class EdgesGeometryEntity extends GeometryEntityMixin(EdgesGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof EdgesGeometry>) {
    super(world, ...args);
    addComponent(world, EdgesGeometryComponent, this.eid);
  }
}

export const ExtrudeGeometryComponent = defineComponent();

export class ExtrudeGeometryEntity extends GeometryEntityMixin(ExtrudeGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof ExtrudeGeometry>) {
    super(world, ...args);
    addComponent(world, ExtrudeGeometryComponent, this.eid);
  }
}

export const IcosahedronGeometryComponent = defineComponent();

export class IcosahedronGeometryEntity extends GeometryEntityMixin(IcosahedronGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof IcosahedronGeometry>) {
    super(world, ...args);
    addComponent(world, DodecahedronGeometryComponent, this.eid);
  }
}

export const LatheGeometryComponent = defineComponent();

export class LatheGeometryEntity extends GeometryEntityMixin(LatheGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof LatheGeometry>) {
    super(world, ...args);
    addComponent(world, LatheGeometryComponent, this.eid);
  }
}

export const OctahedronGeometryComponent = defineComponent();

export class OctahedronGeometryEntity extends GeometryEntityMixin(OctahedronGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof OctahedronGeometry>) {
    super(world, ...args);
    addComponent(world, OctahedronGeometryComponent, this.eid);
  }
}

export const PlaneGeometryComponent = defineComponent();

export class PlaneGeometryEntity extends GeometryEntityMixin(PlaneGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof BoxGeometry>) {
    super(world, ...args);
    addComponent(world, PlaneGeometryComponent, this.eid);
  }
}

export const PolyhedronGeometryComponent = defineComponent();

export class PolyhedronGeometryEntity extends GeometryEntityMixin(PolyhedronGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof PolyhedronGeometry>) {
    super(world, ...args);
    addComponent(world, PolyhedronGeometryComponent, this.eid);
  }
}

export const RingGeometryComponent = defineComponent();

export class RingGeometryEntity extends GeometryEntityMixin(RingGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof RingGeometry>) {
    super(world, ...args);
    addComponent(world, RingGeometryComponent, this.eid);
  }
}

export const ShapeGeometryComponent = defineComponent();

export class ShapeGeometryEntity extends GeometryEntityMixin(ShapeGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof BoxGeometry>) {
    super(world, ...args);
    addComponent(world, ShapeGeometryComponent, this.eid);
  }
}

export const SphereGeometryComponent = defineComponent();

export class SphereGeometryEntity extends GeometryEntityMixin(SphereGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof SphereGeometry>) {
    super(world, ...args);
    addComponent(world, SphereGeometryComponent, this.eid);
  }
}

export const TetrahedronGeometryComponent = defineComponent();

export class TetrahedronGeometryEntity extends GeometryEntityMixin(TetrahedronGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof TetrahedronGeometry>) {
    super(world, ...args);
    addComponent(world, TetrahedronGeometryComponent, this.eid);
  }
}

export const TorusGeometryComponent = defineComponent();

export class TorusGeometryEntity extends GeometryEntityMixin(TorusGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof TorusGeometry>) {
    super(world, ...args);
    addComponent(world, TorusGeometryComponent, this.eid);
  }
}

export const TorusKnotGeometryComponent = defineComponent();

export class TorusKnotGeometryEntity extends GeometryEntityMixin(TorusKnotGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof TorusKnotGeometry>) {
    super(world, ...args);
    addComponent(world, TorusKnotGeometryComponent, this.eid);
  }
}

export const TubeGeometryComponent = defineComponent();

export class TubeGeometryEntity extends GeometryEntityMixin(TubeGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof TubeGeometry>) {
    super(world, ...args);
    addComponent(world, TubeGeometryComponent, this.eid);
  }
}

export const WireframeGeometryComponent = defineComponent();

export class WireframeGeometryEntity extends GeometryEntityMixin(WireframeGeometry) {
  constructor(world: World, ...args: ConstructorParameters<typeof WireframeGeometry>) {
    super(world, ...args);
    addComponent(world, WireframeGeometryComponent, this.eid);
  }
}

export const MaterialComponent = defineMapComponent<IMaterialEntity>();

type IMaterialProps = {
  eid: number;
  store: typeof MaterialComponent;
  textureStore: typeof TextureComponent;
}

export type IMaterialEntity<T extends Material = Material, O extends object = {}> = Override<T, IMaterialProps & O>;

export const MaterialEntityMixin = <T extends Material, O extends object = {}, R extends IMaterialEntity<T, O> = IMaterialEntity<T, O>>(Base: Constructor<T>): Constructor<R> => {
  const TypedBase = Base as any;

  const ReturnType = class extends TypedBase {
    eid: number;
    store: typeof MaterialComponent;
    textureStore: typeof TextureComponent;
    constructor(world: World, ...args: any[]) {
      super(...args);
      const eid = this.eid = addEntity(world);
      this.store = MaterialComponent;
      this.textureStore = TextureComponent;
      addComponent(world, this.store, eid);
      this.store.store.set(eid, this as unknown as IMaterialEntity);
    }
  }

  return ReturnType as unknown as Constructor<R>;
}

export const LineBasicMaterialComponent = defineComponent();

export class LineBasicMaterialEntity extends MaterialEntityMixin(LineBasicMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof LineBasicMaterial>) {
    super(world, ...args);
    addComponent(world, LineBasicMaterialComponent, this.eid);
  }
}

export const LineDashedMaterialComponent = defineComponent();

export class LineDashedMaterialEntity extends MaterialEntityMixin(LineDashedMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof LineDashedMaterial>) {
    super(world, ...args);
    addComponent(world, LineDashedMaterialComponent, this.eid);
  }
}

export const MeshBasicMaterialComponent = defineComponent();

export class MeshBasicMaterialEntity extends MaterialEntityMixin(MeshBasicMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshBasicMaterial>) {
    super(world, ...args);
    addComponent(world, MeshBasicMaterialComponent, this.eid);
  }
}

export const MeshDepthMaterialComponent = defineComponent();

export class MeshDepthMaterialEntity extends MaterialEntityMixin(MeshDepthMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshDepthMaterial>) {
    super(world, ...args);
    addComponent(world, MeshDepthMaterialComponent, this.eid);
  }
}

export const MeshDistanceMaterialComponent = defineComponent();

export class MeshDistanceMaterialEntity extends MaterialEntityMixin(MeshDistanceMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshDistanceMaterial>) {
    super(world, ...args);
    addComponent(world, MeshDistanceMaterialComponent, this.eid);
  }
}

export const MeshLambertMaterialComponent = defineComponent();

export class MeshLambertMaterialEntity extends MaterialEntityMixin(MeshLambertMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshLambertMaterial>) {
    super(world, ...args);
    addComponent(world, MeshLambertMaterialComponent, this.eid);
  }
}

export const MeshMatcapMaterialComponent = defineComponent();

export class MeshMatcapMaterialEntity extends MaterialEntityMixin(MeshMatcapMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshMatcapMaterial>) {
    super(world, ...args);
    addComponent(world, MeshMatcapMaterialComponent, this.eid);
  }
}

export const MeshNormalMaterialComponent = defineComponent();

export class MeshNormalMaterialEntity extends MaterialEntityMixin(MeshNormalMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshNormalMaterial>) {
    super(world, ...args);
    addComponent(world, MeshNormalMaterialComponent, this.eid);
  }
}

export const MeshPhongMaterialComponent = defineComponent();

export class MeshPhongMaterialEntity extends MaterialEntityMixin(MeshPhongMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshPhongMaterial>) {
    super(world, ...args);
    addComponent(world, MeshPhongMaterialComponent, this.eid);
  }
}

export const MeshPhysicalMaterialComponent = defineComponent();

export class MeshPhysicalMaterialEntity extends MaterialEntityMixin(MeshPhysicalMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshPhysicalMaterial>) {
    super(world, ...args);
    addComponent(world, MeshPhysicalMaterialComponent, this.eid);
  }
}

export const MeshStandardMaterialComponent = defineComponent();

export class MeshStandardMaterialEntity extends MaterialEntityMixin(MeshStandardMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshStandardMaterial>) {
    super(world, ...args);
    addComponent(world, MeshStandardMaterialComponent, this.eid);
  }
}

export const MeshToonMaterialComponent = defineComponent();

export class MeshToonMaterialEntity extends MaterialEntityMixin(MeshToonMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof MeshToonMaterial>) {
    super(world, ...args);
    addComponent(world, MeshToonMaterialComponent, this.eid);
  }
}

export const PointsMaterialComponent = defineComponent();

export class PointsMaterialEntity extends MaterialEntityMixin(PointsMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof PointsMaterial>) {
    super(world, ...args);
    addComponent(world, PointsMaterialComponent, this.eid);
  }
}

export const RawShaderMaterialComponent = defineComponent();

export class RawShaderMaterialEntity extends MaterialEntityMixin(RawShaderMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof RawShaderMaterial>) {
    super(world, ...args);
    addComponent(world, RawShaderMaterialComponent, this.eid);
  }
}

export const ShaderMaterialComponent = defineComponent();

export class ShaderMaterialEntity extends MaterialEntityMixin(ShaderMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof ShaderMaterial>) {
    super(world, ...args);
    addComponent(world, ShaderMaterialComponent, this.eid);
  }
}

export const ShadowMaterialComponent = defineComponent();

export class ShadowMaterialEntity extends MaterialEntityMixin(ShadowMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof ShadowMaterial>) {
    super(world, ...args);
    addComponent(world, ShadowMaterialComponent, this.eid);
  }
}

export const SpriteMaterialComponent = defineComponent();

export class SpriteMaterialEntity extends MaterialEntityMixin(SpriteMaterial) {
  constructor(world: World, ...args: ConstructorParameters<typeof SpriteMaterial>) {
    super(world, ...args);
    addComponent(world, SpriteMaterialComponent, this.eid);
  }
}

/**
 * Base Object3D Types:
 * Scene
 * 
 * GLTFLoader Object3D Types:
 * Bone
 * Group
 * Line
 * LineLoop
 * LineSegments
 * Mesh
 * Object3D
 * OrthographicCamera
 * PerspectiveCamera
 * PointLight
 * Points
 * SkinnedMesh
 * SpotLight
 * 
 * three-omi Object3D Types:
 * Audio
 * PositionalAudio
 * AudioListener
 * 
 * Additional Object3D Types:
 * LOD?
 */

export const SceneComponent = defineComponent();
export class SceneEntity extends Object3DEntityMixin(Scene) {
  constructor(world: World) {
    super(world);
    addComponent(world, SceneComponent, this.eid);
  }
}

export class Object3DEntity extends Object3DEntityMixin(Object3D) {
  constructor(world: World) {
    super(world);
  }
}

const MeshBaseComponent = defineComponent({
  geometryEid: Types.eid,
  materialEid: Types.eid,
});


interface IMeshBaseEntityProps {
  meshBaseStore: typeof MeshBaseComponent;
  geometryStore: typeof GeometryComponent;
  materialStore: typeof MaterialComponent;
  geometry: IGeometryEntity;
  material: IMaterialEntity;
}

export const MeshBaseEntityMixin = <T extends Object3D, O extends object = {}, R extends IObject3DEntity<T, O> = IObject3DEntity<T, O>, S extends IObject3DStaticProps = IObject3DStaticProps>(Base: Constructor<T>): Constructor<R, S> => {

  const TypedBase = Base as any;

  const ReturnType = class extends Object3DEntityMixin(TypedBase) {
    meshBaseStore: typeof MeshBaseComponent;
    geometryStore: typeof GeometryComponent;
    materialStore: typeof MaterialComponent;
    constructor(world: World, geometry: IGeometryEntity, material: IMaterialEntity, ...args: ConstructorParameters<typeof TypedBase>) {
      super(world, geometry, material, ...args);
      this.meshBaseStore = MeshBaseComponent;
      this.geometryStore = GeometryComponent;
      this.materialStore = MaterialComponent;
      addComponent(world, this.meshBaseStore, this.eid);
      this.meshBaseStore.geometryEid[this.eid] = geometry.eid;
      this.meshBaseStore.materialEid[this.eid] = material.eid;
    }

    dispose() {
      // if (this.geometry) {
      //   this.geometry
      // }
    }
  }

  return ReturnType as unknown as Constructor<R, S>;
}

const MeshComponent = defineComponent()
export class MeshEntity extends MeshBaseEntityMixin<Mesh, IMeshBaseEntityProps>(Mesh) {
  constructor(world: World, geometry: IGeometryEntity, material: IMaterialEntity) {
    super(world, geometry, material);
    addComponent(world, MeshComponent, this.eid);
  }
}

const SkinnedMeshComponent = defineComponent();
export class SkinnedMeshEntity extends MeshBaseEntityMixin(SkinnedMesh) {
  constructor(world: World, geometry: IGeometryEntity, material: IMaterialEntity) {
    super(world, geometry, material);
    addComponent(world, SkinnedMeshComponent, this.eid);
  }
}

export const InstancedMeshImposterComponent = defineComponent({
  instancedMeshEid: Types.eid,
  instancedMeshIndex: Types.ui32,
  needsUpdate: Types.ui8,
  autoUpdate: Types.ui8,
});

export class InstancedMeshImposterEntity extends MeshBaseEntityMixin(Mesh) {
  constructor(world: World, instancedMesh: InstancedMeshEntity) {
    super(world, instancedMesh.geometry, instancedMesh.material);
    this.visible = false;
    addComponent(world, InstancedMeshImposterComponent, this.eid);
    InstancedMeshImposterComponent.instancedMeshEid[this.eid] = instancedMesh.eid;
    InstancedMeshImposterComponent.instancedMeshIndex[this.eid] = instancedMesh.count++;
    InstancedMeshImposterComponent.needsUpdate[this.eid] = 1;
    InstancedMeshImposterComponent.autoUpdate[this.eid] = 0;
  }
}

export const InstancedMeshComponent = defineComponent();

export class InstancedMeshEntity extends MeshBaseEntityMixin(InstancedMesh) {
  constructor(
    world: World,
    geometry: IGeometryEntity,
    material: IMaterialEntity,
    size: number,
    count: number = 0,
  ) {
    super(world, geometry, material, size);
    addComponent(world, InstancedMeshComponent, this.eid);
    this.instanceMatrix.setUsage(DynamicDrawUsage);
    this.count = count;
  }
  addInstance() {

  }
}

const BoneComponent = defineComponent();
export class BoneEntity extends Object3DEntityMixin(Bone) {
  constructor(world: World) {
    super(world);
    addComponent(world, BoneComponent, this.eid);
  }
}

export const CameraComponent = defineComponent();

const OrthographicCameraComponent = defineComponent();
export class OrthographicCameraEntity extends Object3DEntityMixin(OrthographicCamera) {
  constructor(world: World, ...args: ConstructorParameters<typeof OrthographicCamera>) {
    super(world, ...args);
    addComponent(world, CameraComponent, this.eid);
    addComponent(world, OrthographicCameraComponent, this.eid);
  }
}

const PerspectiveCameraComponent = defineComponent();
export class PerspectiveCameraEntity extends Object3DEntityMixin(PerspectiveCamera) {
  constructor(world: World, ...args: ConstructorParameters<typeof OrthographicCamera>) {
    super(world, ...args);
    addComponent(world, CameraComponent, this.eid);
    addComponent(world, PerspectiveCameraComponent, this.eid);
  }
}

const GroupComponent = defineComponent();
export class GroupEntity extends Object3DEntityMixin(Group) {
  constructor(world: World) {
    super(world);
    addComponent(world, GroupComponent, this.eid);
  }
}

const LineComponent = defineComponent();
export class LineEntity extends MeshBaseEntityMixin(Line) {
  constructor(world: World, geometry: IGeometryEntity, material: IMaterialEntity) {
    super(world, geometry, material);
    addComponent(world, LineComponent, this.eid);
  }
}

const LineLoopComponent = defineComponent();
export class LineLoopEntity extends MeshBaseEntityMixin(LineLoop) {
  constructor(world: World, geometry: IGeometryEntity, material: IMaterialEntity) {
    super(world, geometry, material);
    addComponent(world, LineLoopComponent, this.eid);
  }
}

const LineSegmentsComponent = defineComponent();
export class LineSegmentsEntity extends MeshBaseEntityMixin(LineSegments) {
  constructor(world: World, geometry: IGeometryEntity, material: IMaterialEntity) {
    super(world, geometry, material);
    addComponent(world, LineSegmentsComponent, this.eid);
  }
}

const PointLightComponent = defineComponent();
export class PointLightEntity extends Object3DEntityMixin(PointLight) {
  constructor(world: World, ...args: ConstructorParameters<typeof PointLight>) {
    super(world, ...args);
    addComponent(world, PointLightComponent, this.eid);
  }
}

const PointsComponent = defineComponent();
export class PointsEntity extends MeshBaseEntityMixin(Points) {
  constructor(world: World, geometry: IGeometryEntity, material: IMaterialEntity) {
    super(world, geometry, material);
    addComponent(world, PointsComponent, this.eid);
  }
}

const SpotLightComponent = defineComponent();
export class SpotLightEntity extends Object3DEntityMixin(SpotLight) {
  constructor(world: World, ...args: ConstructorParameters<typeof SpotLight>) {
    super(world, ...args);
    addComponent(world, SpotLightComponent, this.eid);
  }
}


const AudioComponent = defineComponent();
export class AudioEntity extends Object3DEntityMixin(Audio) {
  constructor(world: World, listener: AudioListenerEntity) {
    super(world, listener);
    addComponent(world, AudioComponent, this.eid);
  }
}

const PositionalAudioComponent = defineComponent();
export class PositionalAudioEntity extends Object3DEntityMixin(PositionalAudio) {
  constructor(world: World, listener: AudioListenerEntity) {
    super(world, listener);
    addComponent(world, PositionalAudioComponent, this.eid);
  }
}

const AudioListenerComponent = defineComponent();
export class AudioListenerEntity extends Object3DEntityMixin(AudioListener) {
  constructor(world: World, ...args: ConstructorParameters<typeof AudioListener>) {
    super(world, ...args);
    addComponent(world, AudioListenerComponent, this.eid);
  }
}
