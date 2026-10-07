/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS isolates transpiled source and dependency doubles. */
// Execute the application source with explicit dependency doubles, without a
// Next.js server or access to the developer's database/environment files.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

module.exports = function loadSource(relativePath, doubles = {}) {
  const filename = path.resolve(__dirname, '..', relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = mod.require.bind(mod);
  mod.require = (specifier) => Object.hasOwn(doubles, specifier) ? doubles[specifier] : originalRequire(specifier);
  mod._compile(compiled, filename);
  return mod.exports;
};
