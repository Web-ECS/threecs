import { defineQuery, defineSystem } from "bitecs";
import { RendererComponent } from "../components/Renderer";

export const rendererQuery = defineQuery([RendererComponent]);

export const RendererSystem = defineSystem((world) => {
  const entities = rendererQuery(world);

  entities.forEach((eid) => {
    const { renderer, scene, camera, needsResize } = RendererComponent.get(eid);

    if (scene && camera) {
      if (needsResize) {
        if (camera.isPerspectiveCamera) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        }

        renderer.setSize(window.innerWidth, window.innerHeight, false);
      }

      renderer.render(scene, camera);
    }
  });
});
