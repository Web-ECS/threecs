import path from "path";
import fs from "fs";

const ignorePaths = [".git", "node_modules", "dist", "site"];

function getHtmlPaths(dirPath = __dirname, htmlPaths = {}) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (ignorePaths.includes(file)) {
      continue;
    }

    const absPath = path.join(dirPath, file);

    if (fs.statSync(absPath).isDirectory()) {
      htmlPaths = getHtmlPaths(absPath, htmlPaths);
    } else if (path.extname(file) === ".html") {
      const relPath = path.relative(__dirname, absPath);
      htmlPaths[relPath] = absPath;
    }
  }

  return htmlPaths;
}

export default ({ command, mode }) => {
  if (mode === "site" || command === "serve") {
    let base = "/";
    const repo = process.env.GITHUB_REPOSITORY;

    if (repo) {
      base = `/${repo.split("/")[1]}/`;
    }

    return {
      base,
      build: {
        outDir: path.resolve(__dirname, "site"),
        minify: false,
        rollupOptions: {
          input: getHtmlPaths(),
        },
        optimizeDeps: {
          exclude: ["three"],
        },
      },
      resolve: {
        dedupe: [
          "three",
        ],
      },
      publicDir: path.join(__dirname, "examples", "public"),
    };
  } else {
    return {
      resolve: {
        dedupe: [
          "three",
        ],
      },
      build: {
        lib: {
          entry: path.resolve(__dirname, "src/threecs.ts"),
          name: "THREECS",
          formats: ["es", "cjs"],
        },
        minify: false,
        rollupOptions: {
          external: ["three", /^three\//, "@dimforge/rapier3d-compat", "@webecs/do-three"],
        },
        // Use when npm linking bitecs
        // optimizeDeps: {
        //   exclude: ["@webecs/do-three"],
        // },
      },
    };
  }
};
