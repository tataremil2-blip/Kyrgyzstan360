import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = readFileSync(new URL("../app/admin/(protected)/page.tsx", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function loadDashboard() {
  const exports = {};
  const operations = [];
  let protectedCalls = 0;
  let requestTableCount = 0;
  const request = {
    id: "2d9d182f-17b0-480b-8e5a-3d4d517cd2c8", reference_number: "K360-TEST", customer_name: "Guest Test",
    countries: ["KG"], start_date: null, end_date: null, adults: 2, children: 0, budget: 2500,
    status: "planning", created_at: "2026-11-20T10:00:00.000Z", manager_id: null,
  };
  const db = {
    from(table) {
      const requestIndex = table === "travel_requests" ? ++requestTableCount : 0;
      const op = { table, filters: [], ordering: [] };
      operations.push(op);
      const query = {
        select(columns, options) { op.select = columns; op.selectOptions = options; return query; },
        or(value) { op.filters.push(["or", value]); return query; },
        eq(column, value) { op.filters.push(["eq", column, value]); return query; },
        in(column, value) { op.filters.push(["in", column, value]); return query; },
        order(column, options) { op.ordering.push([column, options]); return query; },
        range(from, to) { op.range = [from, to]; return query; },
        then(resolve, reject) {
          let result;
          if (table === "staff_members") result = { data: [{ user_id: "staff-user", display_name: "Test staff" }], error: null };
          else if (requestIndex === 1) result = { data: [request], count: 26, error: null };
          else result = { data: null, count: 1, error: null };
          return Promise.resolve(result).then(resolve, reject);
        },
      };
      return query;
    },
  };
  vm.runInNewContext(javascript, {
    exports,
    require: (name) => {
      if (name === "next/link") return { default: "Link" };
      if (name === "react/jsx-runtime") return {
        jsx: (type, props, key) => ({ type, props, key }),
        jsxs: (type, props, key) => ({ type, props, key }),
        Fragment: "Fragment",
      };
      if (name === "@/lib/admin/auth") return { requireStaff: async () => { protectedCalls += 1; } };
      if (name === "@/lib/travel-requests/database") return { database: () => db };
      if (name === "@/lib/travel-requests/validation") return { statuses: ["new", "planning"] };
      throw new Error(`Unexpected import: ${name}`);
    },
    URLSearchParams,
    Map,
  });
  return { page: exports.default, operations, getProtectedCalls: () => protectedCalls };
}

function flatten(value, output = []) {
  if (Array.isArray(value)) value.forEach((item) => flatten(item, output));
  else if (value && typeof value === "object") flatten(value.props?.children, output);
  else if (typeof value === "string" || typeof value === "number") output.push(String(value));
  return output;
}

test("CRM dashboard applies search, status, sort, and pagination filters and renders the request list", async () => {
  const { page, operations, getProtectedCalls } = loadDashboard();
  const tree = await page({ searchParams: Promise.resolve({ q: "Guest", status: "planning", sort: "budget", page: "2" }) });
  const list = operations.find((op) => op.table === "travel_requests" && op.selectOptions?.count === "exact");

  assert.equal(getProtectedCalls(), 1);
  assert.ok(list);
  assert.ok(list.filters.some(([kind, value]) => kind === "or" && value.includes("Guest")));
  assert.ok(list.filters.some(([kind, column, value]) => kind === "eq" && column === "status" && value === "planning"));
  assert.equal(list.ordering[0][0], "budget");
  assert.equal(list.ordering[0][1].ascending, false);
  assert.equal(list.ordering[1][0], "id");
  assert.equal(list.range[0], 25);
  assert.equal(list.range[1], 49);
  const text = flatten(tree).join(" ");
  assert.match(text, /Travel requests/);
  assert.match(text, /K360-TEST/);
  assert.match(text, /Guest Test/);
});
