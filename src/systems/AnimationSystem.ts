import { AnimationMixer, AnimationClip, AnimationAction, Object3D } from "three";
import { Object3DComponent } from "../core/components";
import {
  defineMapComponent,
  defineQuery,
  enterQuery,
  addMapComponent,
} from "../core/ECS";
import { World } from "../core/World";


export interface AnimationClipState {
  index: number; // Index
  playing: boolean;
  loop?: number; // Three.js loop enum
}

export  interface AnimationMixerComponentProps {
  state: AnimationClipState[];
}

export const AnimationMixerComponent =
  defineMapComponent<AnimationMixerComponentProps>();

export function addAnimationMixerComponent(
  world: World,
  eid: number,
  props: Partial<AnimationMixerComponentProps> = {}
) {
  addMapComponent(
    world,
    AnimationMixerComponent,
    eid,
    Object.assign(
      {
        state: [],
      },
      props
    )
  );
}

export interface InternalAnimationMixerComponentProps {
  actions: AnimationAction[];
  playingActions: boolean[];
  mixer: AnimationMixer;
}

export const InternalAnimationMixerComponent =
  defineMapComponent<InternalAnimationMixerComponentProps>();

export const AnimationClipsComponent = defineMapComponent<AnimationClip[]>();

export function addAnimationClipsComponent(
  world: World,
  eid: number,
  animations: AnimationClip[]
) {
  addMapComponent(world, AnimationClipsComponent, eid, animations);
}

const animationMixerQuery = defineQuery([
  AnimationMixerComponent,
  Object3DComponent,
]);

const newAnimationMixerQuery = enterQuery(animationMixerQuery);

export const AnimationSystem = function AnimationSystem(
  world: World
) {
  const animationMixerEntities = animationMixerQuery(world);
  const newAnimationMixerEntities = newAnimationMixerQuery(world);

  newAnimationMixerEntities.forEach((eid) => {
    const obj = Object3DComponent.store.get(eid)!;
    const clips = AnimationClipsComponent.store.get(eid);

    const mixer = new AnimationMixer(obj as unknown as Object3D);

    const actions = [];

    if (clips) {
      for (const clip of clips) {
        actions.push(mixer.clipAction(clip));
      }
    }

    addMapComponent(world, InternalAnimationMixerComponent, eid, {
      mixer,
      actions,
      playingActions: actions.map(() => false),
    });
  });

  animationMixerEntities.forEach((eid) => {
    const { state } = AnimationMixerComponent.store.get(eid)!;
    const { mixer, actions, playingActions } =
      InternalAnimationMixerComponent.store.get(eid)!;
    const clips = AnimationClipsComponent.store.get(eid);

    // TODO: add/remove actions using clips/actions arrays

    // TODO: update actions using state/clips arrays

    state.forEach((clipState) => {
      const action = actions[clipState.index];

      if (action) {
        if (clipState.loop !== undefined) {
          action.loop = clipState.loop;
        }
      }

      if (clipState.playing && !playingActions[clipState.index]) {
        action.play();
      } else if (!clipState.playing && playingActions[clipState.index]) {
        action.stop();
      }
    });

    mixer.update(world.dt);
  });

  return world;
};
