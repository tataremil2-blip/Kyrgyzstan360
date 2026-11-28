import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envNames = [
  "APP_BASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "NEXT_PUBLIC_GA_MEASUREMENT_ID", "TURNSTILE_SECRET_KEY",
  "TRIP_REQUEST_RATE_LIMIT_SECRET", "RESEND_API_KEY", "RESEND_FROM_EMAIL",
  "TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "TRIP_REQUEST_OPERATOR_EMAIL",
  "CRON_SECRET", "OPENAI_API_KEY", "OPENAI_PLANNER_MODEL",
];
const safeEnv = { ...process.env };
for (const name of envNames) delete safeEnv[name];

function run(args, cwd = root, env = process.env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd, env, stdio: "inherit" });
    child.once("error", (error) => resolve({ code: 1, error }));
    child.once("exit", (code) => resolve({ code: code ?? 1 }));
  });
}

for (const [label, args] of [
  ["Next route types", ["--require", path.join(root, "scripts", "deny-env-files.cjs"), path.join(root, "node_modules", "next", "dist", "bin", "next"), "typegen"]],
  ["TypeScript", [path.join(root, "node_modules", "typescript", "bin", "tsc"), "--noEmit"]],
  ["ESLint", [path.join(root, "node_modules", "eslint", "bin", "eslint.js")]],
  ["Automated tests", ["--test"]],
]) {
  console.log(`\n=== ${label} ===`);
  const result = await run(args, root, safeEnv);
  if (result.code !== 0) process.exit(result.code);
}

const buildEnv = { ...safeEnv, NODE_ENV: "production" };
Object.assign(buildEnv, {
  APP_BASE_URL: "https://preview.invalid",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "turnstile_qa_placeholder",
  NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
  TURNSTILE_SECRET_KEY: "",
  TRIP_REQUEST_RATE_LIMIT_SECRET: "qa-only-placeholder",
  RESEND_API_KEY: "",
  RESEND_FROM_EMAIL: "",
  TELEGRAM_BOT_TOKEN: "",
  TELEGRAM_CHAT_ID: "",
  TRIP_REQUEST_OPERATOR_EMAIL: "",
  CRON_SECRET: "",
  OPENAI_API_KEY: "",
  OPENAI_PLANNER_MODEL: "gpt-4.1-mini",
  K360_QA_SINGLE_WORKER: "1",
});

console.log("\n=== Webpack production build (with .env files blocked) ===");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const guard = path.join(root, "scripts", "deny-env-files.cjs");
const buildResult = await run(["--require", guard, nextBin, "build", "--webpack"], root, buildEnv);
if (buildResult.code !== 0) process.exitCode = buildResult.code;
