import { Object3D, Mesh, BufferGeometry, Material } from "three";
import {
  addEntity,
  removeEntity,
  addComponent,
  removeComponent,
  getEntityComponents,
  hasComponent,
  defineQuery,
} from "bitecs";

interface Plugin {
  init(world: World): Promise<void>;
}

interface WorldOptions {}

export class World {
  public entities: Entity[] = [];
  private plugins: Plugin[] = [];
  private systems: System[] = [];

  constructor(options: WorldOptions) {}

  setSystems(systems: System[]) {
    this.systems = systems;
  }

  registerPlugin(plugin: Plugin) {}

  async init() {
    await Promise.all(this.plugins.map((plugin) => plugin.init(this)));
  }
}

interface EntityConstructor<T extends Object3D | undefined = undefined> {
  from(source: T, parent?: Entity<T>): Entity<T>;
}

type Entity<T extends Object3D | undefined = undefined> = T & {
  eid: number;
  dispose(recursive?: boolean): void;
};

const Object3DEntities: Map<Function, EntityConstructor<Object3D>> = new Map();

class Object3DEntity extends Object3D implements Entity<Object3D> {
  eid: number;

  declare parent: Object3DEntity | null;
  declare children: Object3DEntity[];

  static from(
    world: World,
    source: Object3D,
    parent: Object3DEntity
  ): Object3DEntity {
    const obj = new Object3DEntity(world).copy(source as Object3DEntity, false);

    obj.parent = parent;

    for (let i = 0; i < source.children.length; i++) {
      const objConstructor = Object3DEntities.get(source.constructor);

      if (!objConstructor) {
        throw new Error(
          `Couldn't find Object3D Entity constructor for ${source.constructor?.name}`
        );
      }

      obj.children.push(objConstructor.from(world, source.children[i], obj));
    }

    return obj;
  }

  constructor(world: World) {
    super();

    this.eid = addEntity(world);
  }

  dispose(recursive: boolean = true) {
    this.parent?.remove(this);

    if (recursive) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].dispose(true);
      }
    }
  }
}

Object3DEntities.set(Object3D, Object3DEntity);

class MeshEntity extends Mesh implements Entity<Mesh> {
  eid: number;

  declare parent: Entity<Object3D> | null;
  declare children: Entity<Object3D>[];

  static from(
    world: World,
    source: Mesh,
    parent: Entity<Object3D>
  ): MeshEntity {
    const obj = new MeshEntity(world, undefined).copy(
      source as MeshEntity,
      false
    );

    obj.parent = parent;

    for (let i = 0; i < source.children.length; i++) {
      const objConstructor = Object3DEntities.get(source.constructor);

      if (!objConstructor) {
        throw new Error(
          `Couldn't find Mesh Entity constructor for ${source.constructor?.name}`
        );
      }

      obj.children.push(objConstructor.from(source.children[i], obj));
    }

    return obj;
  }

  constructor(
    public readonly world: World,
    geometry?: BufferGeometry,
    material?: Material
  ) {
    super(geometry, material);

    this.eid = addEntity(world);
  }

  dispose(recursive: boolean = true) {
    this.parent?.remove(this);

    if (recursive) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].dispose(true);
      }
    }
  }
}

Object3DEntities.set(Mesh, MeshEntity);

new MeshEntity().add(new Object3DEntity());

type System = (world: World) => World;

const meshQuery = defineQuery([MeshEntity]);

function MeshColorChangeSystem(world: World) {
  const entityIds = meshQuery(world);

  entityIds.forEach((eid) => {
    world.entities[eid];
  });
}
