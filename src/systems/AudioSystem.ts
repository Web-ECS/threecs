import { Audio, AudioListener, PositionalAudio } from "three";
import { Object3DComponent } from "../core/components";
import {
  defineMapComponent,
  defineComponent,
  defineQuery,
  enterQuery,
  addMapComponent,
  addComponent,
  singletonQuery,
} from "../core/ECS";

import { World } from '../core/World'
import { AudioEntity, AudioListenerEntity, PositionalAudioEntity } from "../threecs";

export const AudioListenerComponent = defineComponent({});

export function addAudioListenerComponent(world: World, eid: number) {
  addComponent(world, AudioListenerComponent, eid);
}

export const InternalAudioListenerComponent =
  defineMapComponent<AudioListenerEntity>();

enum AudioSourceType {
  Stereo = "stereo",
  PannerNode = "pannernode",
}

enum AudioDistanceModel {
  Linear = "linear",
  Inverse = "inverse",
  Exponential = "exponential",
}

type AudioSourceComponentProps = (
  | { audioType: AudioSourceType.Stereo }
  | {
    audioType: AudioSourceType.PannerNode;
    coneInnerAngle: number;
    coneOuterAngle: number;
    coneOuterGain: number;
    distanceModel: AudioDistanceModel;
    maxDistance: number;
    refDistance: number;
    rolloffFactor: number;
  }
) & { src: string; volume: number; loop: boolean; autoPlay: boolean };

export const AudioSourceComponent =
  defineMapComponent<AudioSourceComponentProps>();

export const InternalAudioSourceComponent =
  defineMapComponent<AudioEntity | PositionalAudioEntity>();

export function addAudioSourceComponent(
  world: World,
  eid: number,
  props: AudioSourceComponentProps
) {
  addMapComponent(world, AudioSourceComponent, eid, props);
}

export const audioListenerQuery = defineQuery([
  AudioListenerComponent,
  Object3DComponent,
]);

export const mainAudioListenerQuery = singletonQuery(audioListenerQuery);
export const newAudioListenerQuery = enterQuery(audioListenerQuery);

export const audioSourceQuery = defineQuery([
  AudioSourceComponent,
  Object3DComponent,
]);

export const AudioSystem = function AudioSystem(world: World) {
  const newAudioListenerEntities = newAudioListenerQuery(world);

  newAudioListenerEntities.forEach((eid) => {
    const obj = Object3DComponent.store.get(eid)!;
    const audioListener = new AudioListenerEntity(world);
    // todo: change .add to .addEntity to keep original threejs api?
    obj._add(audioListener);
    addMapComponent(world, InternalAudioListenerComponent, eid, audioListener);
  });

  const mainAudioListenerEid = mainAudioListenerQuery(world);

  if (mainAudioListenerEid === undefined) {
    return;
  }

  const audioListener =
    InternalAudioListenerComponent.store.get(mainAudioListenerEid)!;

  const audioSourceEntities = audioSourceQuery(world);

  for (let i = 0; i < audioSourceEntities.length; i++) {
    const eid = audioSourceEntities[i];

    const obj = Object3DComponent.store.get(eid)!;
    const audioSourceProps = AudioSourceComponent.store.get(eid)!;
    let audioSource = InternalAudioSourceComponent.store.get(eid);

    if (!audioSource) {
      const el = document.createElement("audio");
      el.setAttribute("playsinline", "");
      el.setAttribute("webkip-playsinline", "");
      el.crossOrigin = "anonymous";

      if (audioSourceProps.audioType === AudioSourceType.Stereo) {
        audioSource = new AudioEntity(world, audioListener);
      } else if (audioSourceProps.audioType === AudioSourceType.PannerNode) {
        audioSource = new PositionalAudioEntity(world, audioListener);
      } else {
        throw new Error("Unknown audio source type");
      }

      InternalAudioSourceComponent.store.set(eid, audioSource);
      audioSource.setMediaElementSource(el);
      obj.add(audioSource);
    }

    const { src, volume, loop, autoPlay } = audioSourceProps;

    if (audioSourceProps.audioType === AudioSourceType.PannerNode) {
      const {
        coneInnerAngle,
        coneOuterAngle,
        coneOuterGain,
        distanceModel,
        maxDistance,
        refDistance,
        rolloffFactor,
      } = audioSourceProps;

      const positionalAudio = audioSource as PositionalAudioEntity;
      const pannerNode = positionalAudio.panner;

      if (
        pannerNode.coneInnerAngle !== coneInnerAngle ||
        pannerNode.coneOuterAngle !== coneOuterAngle ||
        pannerNode.coneOuterGain !== coneOuterGain
      ) {
        positionalAudio.setDirectionalCone(
          coneInnerAngle,
          coneOuterAngle,
          coneOuterGain
        );
      }

      if (pannerNode.distanceModel !== distanceModel) {
        positionalAudio.setDistanceModel(distanceModel);
      }

      if (pannerNode.maxDistance !== maxDistance) {
        positionalAudio.setMaxDistance(maxDistance);
      }

      if (pannerNode.refDistance !== refDistance) {
        positionalAudio.setRefDistance(refDistance);
      }

      if (pannerNode.rolloffFactor !== rolloffFactor) {
        positionalAudio.setRolloffFactor(rolloffFactor);
      }
    }

    const el = (audioSource.source as unknown as MediaElementAudioSourceNode)
      .mediaElement;

    if (el.src !== src) {
      el.src = src;
    }

    if (el.loop !== loop) {
      el.loop = loop;
    }

    if (el.autoplay !== autoPlay) {
      el.autoplay = autoPlay;
    }

    if (audioSource.gain.gain.value !== volume) {
      audioSource.setVolume(volume);
    }

  };

  return world;
};
