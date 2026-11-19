import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const url = new URL('../lib/route-catalog.ts', import.meta.url);
const code = ts.transpileModule(readFileSync(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
const exports = {};
vm.runInNewContext(code, { exports, require: createRequire(url) });
const { routeCatalog, validateCatalog, generationReadiness } = exports;
const errors = validateCatalog();
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else {
  console.log(`Catalog valid: ${routeCatalog.places.length} places, ${routeCatalog.segments.length} segments, ${routeCatalog.routes.length} routes, ${routeCatalog.tariffs.length} tariffs.`);
  const asOf = new Date().toISOString().slice(0, 10);
  for (const route of routeCatalog.routes) {
    const result = generationReadiness(route.id, asOf);
    console.log(`${route.id}: ${result.ready ? 'ready for planning validation' : `draft, ${result.blockers.length} unresolved checks`}`);
  }
}
