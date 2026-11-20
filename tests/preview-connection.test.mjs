import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
const source = readFileSync(new URL('../lib/admin/preview-connection.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
vm.runInNewContext(output, { exports, require: () => ({}), process: { env: {} } });
const valid = { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'feature/travel-requests-mvp', NEXT_PUBLIC_SUPABASE_URL: 'https://epyifhlwdhzlpfpnavkg.supabase.co' };
test('login diagnostics require exact Preview environment, branch and Supabase project', async () => {
  assert.equal(exports.diagnosticsEnabled(valid), true);
  for (const override of [{ VERCEL_ENV: 'production' }, { VERCEL_GIT_COMMIT_REF: 'main' }, { NEXT_PUBLIC_SUPABASE_URL: 'https://hrbibxosracivpvgzkyo.supabase.co' }]) {
    assert.equal(exports.diagnosticsEnabled({ ...valid, ...override }), false);
  }
  await exports.diagnosePreviewConnection();
});
