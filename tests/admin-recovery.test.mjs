import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const routeSource = readFileSync(new URL("../app/admin/auth/confirm/route.ts", import.meta.url), "utf8");
const routeJavascript = ts.transpileModule(routeSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

class TestNextResponse extends Response {
  cookieWrites = [];

  constructor(body, init) {
    super(body, init);
    this.cookies = {
      set: (name, value, options) => this.cookieWrites.push({ name, value, options }),
    };
  }

  static redirect(url, status = 307) {
    return new TestNextResponse(null, { status, headers: { Location: url.toString() } });
  }
}

function loadRoute({ verify = async () => ({ data: { user: { id: "staff-id" }, session: { access_token: "test-session" } }, error: null }),
  writeSessionCookie = true } = {}) {
  const exports = {};
  const verified = [];
  const logCalls = [];
  const fakeSupabase = {
    auth: {
      verifyOtp: async (input) => {
        verified.push(input);
        const result = await verify(input);
        if (writeSessionCookie && result.data?.session) {
          cookieAdapter.setAll([{ name: "sb-preview-auth-token", value: "test-session", options: { maxAge: 3600 } }]);
        }
        return result;
      },
    },
  };
  let cookieAdapter;

  const mockRequire = (name) => {
    if (name === "next/server") return { NextResponse: TestNextResponse };
    if (name === "@supabase/ssr") return {
      createServerClient: (_url, _key, options) => {
        cookieAdapter = options.cookies;
        return fakeSupabase;
      },
    };
    if (name === "@/lib/admin/auth") return {
      safeAdminPath: (value) => value === "/admin/auth/complete" ? value : "/admin",
    };
    throw new Error(`Unexpected import: ${name}`);
  };

  vm.runInNewContext(routeJavascript, {
    exports,
    require: mockRequire,
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://preview.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable" } },
    URL,
    Response,
    Object,
    console: {
      error: (...args) => logCalls.push(args.join(" ")),
      warn: (...args) => logCalls.push(args.join(" ")),
      log: (...args) => logCalls.push(args.join(" ")),
    },
  });

  return { route: exports, verified, logCalls };
}

function makeRequest(url, { method = "GET", body, origin, headers = {} } = {}) {
  const parsed = new URL(url);
  const request = new Request(parsed, {
    method,
    body,
    headers: {
      ...(method === "POST" ? { "content-type": "application/x-www-form-urlencoded", origin: origin ?? parsed.origin } : {}),
      ...headers,
    },
  });
  request.nextUrl = parsed;
  request.cookies = {
    getAll: () => [],
    set: () => {},
  };
  return request;
}

function recoveryPost(token = "test-token-hash", origin = "https://preview.example") {
  return makeRequest("https://preview.example/admin/auth/confirm", {
    method: "POST",
    origin,
    body: new URLSearchParams({ type: "recovery", token_hash: token }),
  });
}

test("GET recovery confirmation displays a user step without verifying the token", async () => {
  const { route, verified } = loadRoute();
  const request = makeRequest("https://preview.example/admin/auth/confirm?type=recovery&next=%2Fadmin%2Fauth%2Fcomplete#token_hash=secret-test-hash");
  const response = await route.GET(request);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.equal(verified.length, 0);
  assert.match(body, /method="post"/);
  assert.match(body, /location\.hash/);
  assert.match(body, /history\.replaceState/);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(body.includes("secret-test-hash"), false);
});

test("reopening the recovery email link does not consume the token", async () => {
  const { route, verified } = loadRoute();
  const link = "https://preview.example/admin/auth/confirm?type=recovery&next=%2Fadmin%2Fauth%2Fcomplete#token_hash=reopen-token";
  const first = await route.GET(makeRequest(link));
  const second = await route.GET(makeRequest(link));

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(verified.length, 0);
});

test("valid recovery token sets a secure SSR session and redirects to password setup", async () => {
  const { route, verified } = loadRoute();
  const response = await route.POST(recoveryPost());

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://preview.example/admin/auth/complete");
  assert.equal(verified.length, 1);
  assert.equal(verified[0].token_hash, "test-token-hash");
  assert.equal(verified[0].type, "recovery");
  assert.equal(response.cookieWrites.length, 1);
  assert.equal(response.cookieWrites[0].options.httpOnly, true);
  assert.equal(response.cookieWrites[0].options.secure, true);
  assert.equal(response.cookieWrites[0].options.sameSite, "lax");
  assert.equal(response.cookieWrites[0].options.path, "/");
  assert.equal("domain" in response.cookieWrites[0].options, false);
});

for (const [label, authError] of [
  ["invalid", { code: "otp_expired", message: "invalid token" }],
  ["already used", { code: "otp_already_used", message: "token already used" }],
  ["expired", { code: "otp_expired", message: "expired token" }],
]) {
  test(`${label} recovery token returns a generic error without leaking details`, async () => {
    const { route, logCalls } = loadRoute({ verify: async () => ({ data: { user: null, session: null }, error: authError }) });
    const secretToken = "unlogged-test-token";
    const response = await route.POST(recoveryPost(secretToken));
    const location = response.headers.get("location");
    const body = await response.text();

    assert.equal(response.status, 303);
    assert.match(location, /^https:\/\/preview\.example\/admin\/login\?authError=invalid_link$/);
    assert.equal(location.includes(secretToken), false);
    assert.equal(body.includes(secretToken), false);
    assert.equal(logCalls.some((entry) => entry.includes(secretToken)), false);
  });
}

test("missing session cookie after verification fails closed", async () => {
  const { route } = loadRoute({ writeSessionCookie: false });
  const response = await route.POST(recoveryPost());

  assert.equal(response.status, 303);
  assert.match(response.headers.get("location"), /\/admin\/login\?authError=invalid_link$/);
  assert.equal(response.cookieWrites.length, 0);
});

test("replaying a consumed token is rejected after the first verification", async () => {
  let count = 0;
  const { route } = loadRoute({ verify: async () => {
    count += 1;
    return count === 1
      ? { data: { user: { id: "staff-id" }, session: { access_token: "test-session" } }, error: null }
      : { data: { user: null, session: null }, error: { code: "otp_already_used" } };
  } });
  const first = await route.POST(recoveryPost());
  const second = await route.POST(recoveryPost());

  assert.equal(first.status, 303);
  assert.equal(first.headers.get("location"), "https://preview.example/admin/auth/complete");
  assert.match(second.headers.get("location"), /\/admin\/login\?authError=invalid_link$/);
});

test("cross-origin verification POST is rejected before contacting Supabase", async () => {
  const { route, verified } = loadRoute();
  const response = await route.POST(recoveryPost("test-token-hash", "https://attacker.example"));

  assert.equal(response.status, 303);
  assert.equal(verified.length, 0);
  assert.match(response.headers.get("location"), /\/admin\/login\?authError=invalid_link$/);
});

test("legacy code links remain available for non-recovery Auth flows", async () => {
  const { route } = loadRoute();
  const response = await route.GET(makeRequest("https://preview.example/admin/auth/confirm?code=legacy-code&type=invite&next=%2Fadmin%2Fauth%2Fcomplete"));

  assert.equal(response.status, 303);
  const target = new URL(response.headers.get("location"));
  assert.equal(target.pathname, "/admin/auth/callback");
  assert.equal(target.searchParams.get("code"), "legacy-code");
  assert.equal(target.searchParams.get("type"), "invite");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});
