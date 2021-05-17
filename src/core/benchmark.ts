import { System } from "./ECS";

export function benchmark(system: System, count: number = 500): System {
  const times: number[] = [];

  let finished = false;

  return function benchmarkedSystem(world) {
    const start = performance.now();

    system(world);

    const finish = performance.now();

    if (times.length < count) {
      times.push(finish - start);
    } else if (times.length === count && !finished) {
      finished = true;
      let total: number = 0;

      for (let i = 0; i < count; i++) {
        total += times[i];
      }

      times.sort((a, b) => a - b);

      console.log({
        name: system.name,
        total,
        mean: total / count,
        median: times[Math.floor(count / 2)],
      });
    }

    return world;
  };
}
