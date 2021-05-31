const p = function polyfill(modulePath = ".", importFunctionName = "__import__") {
  try {
    self[importFunctionName] = new Function("u", `return import(u)`);
  } catch (error) {
    const baseURL = new URL(modulePath, location);
    const cleanup = (script) => {
      URL.revokeObjectURL(script.src);
      script.remove();
    };
    self[importFunctionName] = (url) => new Promise((resolve, reject) => {
      const absURL = new URL(url, baseURL);
      if (self[importFunctionName].moduleMap[absURL]) {
        return resolve(self[importFunctionName].moduleMap[absURL]);
      }
      const moduleBlob = new Blob([
        `import * as m from '${absURL}';`,
        `${importFunctionName}.moduleMap['${absURL}']=m;`
      ], {type: "text/javascript"});
      const script = Object.assign(document.createElement("script"), {
        type: "module",
        src: URL.createObjectURL(moduleBlob),
        onerror() {
          reject(new Error(`Failed to import: ${url}`));
          cleanup(script);
        },
        onload() {
          resolve(self[importFunctionName].moduleMap[absURL]);
          cleanup(script);
        }
      });
      document.head.appendChild(script);
    });
    self[importFunctionName].moduleMap = {};
  }
};
p("/threecs/assets/");
var styles = "html, body {\n  margin: 0;\n  padding: 0;\n  background-color: black;\n}\n\nhtml, body, .container {\n  height: 100%;\n}\n\nbody {\n  font-family: 'Courier New', Courier, monospace;\n}\n\n.container {\n  display: flex;\n}\n\nnav {\n  padding: 20px;\n  width: 200px;\n  background-color: white;\n}\n\nnav li {\n  list-style: none;\n  margin: 8px;\n}\n\nnav a {\n  text-decoration: none;\n  color: #222;\n}\n\niframe, main {\n  width: 100%;\n  height: 100%;\n  background-color: black;\n  border: none;\n  color: white;\n}\n\n.center {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  height: 100%;\n}\n\n.center a {\n  color: white;\n}\n\na:visited {\n  color: inherit;\n}";
