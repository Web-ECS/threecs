import { Vector3 } from 'three'

export type Vector3SoA = {
  x: Float32Array
  y: Float32Array
  z: Float32Array
}

export class Vector3ProxySoA extends Vector3 {
	store
	eid
	constructor(store: Vector3SoA, eid: number, x = 0, y = 0, z = 0 ) {

		super(x,y,z)

		this.eid = eid
		this.store = store

		this.store.x[this.eid] = x
		this.store.y[this.eid] = y
		this.store.z[this.eid] = z

	}
	//@ts-ignore
	get x() {
		if(this.store)
	  return this.store.x[this.eid]
	}
	set x(v: number) {
		if(this.store)
		this.store.x[this.eid] = v
	}
	//@ts-ignore
	get y() {
		if(this.store)
		return this.store.y[this.eid]
	}
	set y(v: number) {
		if(this.store)
		this.store.y[this.eid] = v
	}
	//@ts-ignore
	get z() {
		if(this.store)
		return this.store.z[this.eid]
	}
	set z(v: number) {
		if(this.store)
		this.store.z[this.eid] = v
	}
}

export class Vector3ProxyAoA extends Vector3 {
	store
	constructor(store: Float32Array, x = 0, y = 0, z = 0 ) {

		super(x,y,z)

		this.store = store

		this.x = x;
		this.y = y;
		this.z = z;

	}
	//@ts-ignore
	get x() {
		if(this.store)
	  return this.store[0]
	}
	set x(v: number) {
		if(this.store)
		this.store[0] = v
	}
	//@ts-ignore
	get y() {
		if(this.store)
		return this.store[1]
	}
	set y(v: number) {
		if(this.store)
		this.store[1] = v
	}
	//@ts-ignore
	get z() {
		if(this.store)
		return this.store[2]
	}
	set z(v: number) {
		if(this.store)
		this.store[2] = v
	}

}
