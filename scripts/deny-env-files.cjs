/* eslint-disable @typescript-eslint/no-require-imports -- Node's --require preloads must be CommonJS. */
const fs = require("node:fs");
const path = require("node:path");
const blocked = (value) => {
  const filename = value instanceof URL ? value.pathname : String(value);
  return /^\.env(?:\.|$)/i.test(path.basename(filename));
};
const missingEnv = () => {
  const error = new Error("Environment files are disabled for this build");
  error.code = "ENOENT";
  return error;
};
const deny = () => { throw missingEnv(); };

for (const method of ["readFileSync", "openSync", "statSync", "lstatSync"]) {
  const original = fs[method];
  fs[method] = function (filename, ...args) {
    if (blocked(filename)) return deny();
    return original.call(this, filename, ...args);
  };
}
const originalExists = fs.existsSync;
fs.existsSync = function (filename) {
  return blocked(filename) ? false : originalExists.call(this, filename);
};
for (const method of ["readFile", "open", "stat", "lstat"]) {
  const original = fs[method];
  fs[method] = function (filename, ...args) {
    if (blocked(filename)) {
      const callback = args.at(-1);
      if (typeof callback === "function") return callback(missingEnv());
      return Promise.reject(missingEnv());
    }
    return original.call(this, filename, ...args);
  };
  const promiseMethod = fs.promises?.[method];
  if (promiseMethod) {
    fs.promises[method] = function (filename, ...args) {
      return blocked(filename) ? Promise.reject(missingEnv()) : promiseMethod.call(this, filename, ...args);
    };
  }
}
