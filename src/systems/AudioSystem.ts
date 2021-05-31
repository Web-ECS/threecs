import { Audio, AudioListener, PositionalAudio } from "three";
import { Object3DComponent } from "../components";
import {
  defineSystem,
  World,
  defineMapComponent,
  defineComponent,
  defineQuery,
  enterQuery,
  addMapComponent,
  addComponent,
  singletonQuery,
} from "../core/ECS";

export const AudioListenerComponent = defineComponent({});

export function addAudioListenerComponent(world: World, eid: number) {
  addComponent(world, AudioListenerComponent, eid);
}

export const InternalAudioListenerComponent =
  defineMapComponent<AudioListener>();

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
  defineMapComponent<Audio<GainNode | PannerNode> | PositionalAudio>();

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

export const AudioSystem = defineSystem(function AudioSystem(world: World) {
  const newAudioListenerEntities = newAudioListenerQuery(world);

  newAudioListenerEntities.forEach((eid) => {
    const obj = Object3DComponent.storage.get(eid)!;
    const audioListener = new AudioListener();
    obj.add(audioListener);
    addMapComponent(world, InternalAudioListenerComponent, eid, audioListener);
  });

  const mainAudioListenerEid = mainAudioListenerQuery(world);

  if (mainAudioListenerEid === undefined) {
    return;
  }

  const audioListener =
    InternalAudioListenerComponent.storage.get(mainAudioListenerEid)!;

  const audioSourceEntities = audioSourceQuery(world);

  audioSourceEntities.forEach((eid) => {
    const obj = Object3DComponent.storage.get(eid)!;
    const audioSourceProps = AudioSourceComponent.storage.get(eid)!;
    let audioSource = InternalAudioSourceComponent.storage.get(eid);

    if (!audioSource) {
      const el = document.createElement("audio");
      el.setAttribute("playsinline", "");
      el.setAttribute("webkip-playsinline", "");
      el.crossOrigin = "anonymous";

      if (audioSourceProps.audioType === AudioSourceType.Stereo) {
        audioSource = new Audio(audioListener);
      } else if (audioSourceProps.audioType === AudioSourceType.PannerNode) {
        audioSource = new PositionalAudio(audioListener);
      } else {
        throw new Error("Unknown audio source type");
      }

      InternalAudioSourceComponent.storage.set(eid, audioSource);
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

      const positionalAudio = audioSource as PositionalAudio;
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
  });
});
