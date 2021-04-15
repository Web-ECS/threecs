import path from "path";
import fs from "fs";
import crypto from "crypto";

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
    return {
      build: {
        outDir: path.resolve(__dirname, "site"),
        minify: false,
        rollupOptions: {
          input: getHtmlPaths(),
        },
      },
    };
  } else {
    return {
      build: {
        lib: {
          entry: path.resolve(__dirname, "src/threecs.js"),
          name: "THREECS",
          formats: ["es", "cjs"],
        },
        minify: false,
        rollupOptions: {
          external: ["three", "bitecs"],
        },
      },
    };
  }
};