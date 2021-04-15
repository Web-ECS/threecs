import { defineQuery, defineSystem } from "bitecs";
import { RendererComponent } from "../components/RendererComponent";

export const rendererQuery = defineQuery([RendererComponent]);

export function initRendererSystem(world) {
  function onResize() {
    const entities = rendererQuery(world);

    entities.forEach((eid) => {
      const component = RendererComponent.get(eid);
      component.needsResize = true;
    });
  }

  // TODO: Probably debounce the resize event callback
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("resize", onResize);
  };
}

export const RendererSystem = defineSystem((world) => {
  const entities = rendererQuery(world);

  entities.forEach((eid) => {
    const component = RendererComponent.get(eid);
    const { renderer, scene, camera, needsResize } = component;

    if (scene && camera) {
      if (needsResize) {
        if (camera.isPerspectiveCamera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }

        renderer.setSize(window.innerWidth, window.innerHeight);

        component.needsResize = false;
      }

      renderer.render(scene, camera);
    }
  });
});
