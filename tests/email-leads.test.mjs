import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);
const source = p => readFileSync(new URL(p, root), "utf8");
function compile(s) { return ts.transpileModule(s, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText; }
const validation = {};
vm.runInNewContext(compile(source("lib/email-leads/validation.ts")), { exports: validation });
function load(options = {}) {
  const calls = { rate: [], fetch: [] };
  const exports = {};
  const env = { NODE_ENV:"production", VERCEL:"1", VERCEL_ENV:"preview", APP_BASE_URL:"https://test.vercel.app", RESEND_API_KEY:"re_test", TURNSTILE_SECRET_KEY:"test", TRIP_REQUEST_RATE_LIMIT_SECRET:"test-secret-only-01234567890123456789", RESEND_FROM_EMAIL:"Kyrgyzstan360 <travel@kyrgyzstan360.com>", TRIP_REQUEST_OPERATOR_EMAIL:"tataremil2@gmail.com", ...options.env };
  vm.runInNewContext(compile(source("app/api/email-leads/route.ts")), {
    exports, process:{env}, URL, URLSearchParams, Headers, Response, Request, AbortSignal, TextDecoder, Uint8Array,
    require(name) {
      if(name.startsWith("node:")) return require(name);
      if(name === "@/lib/email-leads/validation") return validation;
      if(name === "@vercel/firewall") return {checkRateLimit:async(id,args)=>{calls.rate.push({id,args});if(options.rateThrow)throw Error("private");return options.rate ?? {rateLimited:false};}};
      throw Error("Forbidden dependency: " + name);
    },
    fetch: async (url, init) => {
      calls.fetch.push({url,init});
      if(url.includes("siteverify")) {
        if(options.challengeThrow)throw Error("private");
        return Response.json({success:true, hostname:"test.vercel.app", action:"trip_request", ...options.challenge}, {status:options.challengeStatus??200});
      }
      if(options.sendThrow)throw Error("private");
      return Response.json(options.receipt ?? {id:"00000000-0000-4000-8000-000000000001"}, {status:options.sendStatus??200,headers:options.replayed?{"idempotent-replayed":"true"}:{}});
    },
    console: new Proxy({}, {get(){return ()=>{throw Error("Must not log personal information");};}})
  });
  return {post:exports.POST,calls};
}
const input = extra => ({name:"TEST Traveler",email:"guest@example.com",token:"test-token",...extra});
const req = (body, overrides={}) => new Request("https://test.vercel.app/api/email-leads", {method:"POST",headers:{"content-type":"application/json",origin:"https://test.vercel.app","x-vercel-forwarded-for":"192.0.2.1",...overrides},body:typeof body==="string"?body:JSON.stringify(body)});

test("email-only accepts minimal data and sends only one operator email with Reply-To",async()=>{
  const{post,calls}=load();
  const res=await post(req(input()));
  assert.equal(res.status,201);
  assert.equal(calls.rate.length,2);
  assert.equal(calls.fetch.length,2);
  const email=JSON.parse(calls.fetch[1].init.body);
  assert.deepEqual(email.to,["tataremil2@gmail.com"]);
  assert.equal(email.reply_to,"guest@example.com");
  assert.equal(email.from,"Kyrgyzstan360 <travel@kyrgyzstan360.com>");
  assert.equal(email.html,undefined);
  assert.match(email.text,/Travelers: Not specified/);
  assert.match(email.text,/Budget per person \(USD\): Not specified/);
});
test("fail closed on unavailable rate limit, invalid config and non-Vercel execution",async()=>{
  for(const options of [{rate:{rateLimited:false,error:"not-found"}},{rateThrow:true},{env:{VERCEL:""}},{env:{NODE_ENV:"development"}},{env:{TRIP_REQUEST_RATE_LIMIT_SECRET:""}},{env:{RESEND_FROM_EMAIL:"other@example.com"}},{env:{APP_BASE_URL:"https://www.kyrgyzstan360.com"}},{env:{VERCEL_ENV:"production"}}]){
    const {post,calls}=load(options); assert.equal((await post(req(input()))).status,503); assert.equal(calls.fetch.length,0);
  }
});
test("both IP and email use hashed distributed buckets; blocked returns 429 before sending",async()=>{
 const{post,calls}=load({rate:{rateLimited:true}});
 assert.equal((await post(req(input()))).status,429);
 assert.equal(calls.fetch.length,0);
 assert.notEqual(calls.rate[0].args.rateLimitKey,calls.rate[1].args.rateLimitKey);
 assert.match(calls.rate[0].args.rateLimitKey,/^[a-f0-9]{64}$/);
 assert.equal(calls.rate[0].args.timeout,2500);
});
test("reject bad origin, invalid JSON, oversized body, invalid input and headers",async()=>{
 for(const [body,headers,status] of [
   [input(),{origin:"https://evil.invalid"},403],
   [input(),{"content-type":"text/plain"},415],
   ["{",{},400],[" ".repeat(17000),{},400],
   [input({name:""}),{},400],[input({email:"victim@example.com\r\nBcc: evil@example.com"}),{},400],
   [input({adults:0}),{},400],[input({budget:-1}),{},400],
   [input({dateMode:"exact",startDate:"2027-02-30",endDate:"2027-03-04"}),{},400],
   [input({dateMode:"approximate",preferredPeriod:"2027-13"}),{},400],
   [input({preferences:"x".repeat(3001)}),{},400],[input({token:""}),{},400],
   [input(),{"x-vercel-forwarded-for":"spoofed"},503]
 ]){
   const{post,calls}=load();assert.equal((await post(req(body,headers))).status,status);assert.equal(calls.fetch.length,0);
 }
});
test("Turnstile failure, wrong action or hostname never reaches Resend",async()=>{
 for(const options of [{challenge:{success:false}},{challenge:{hostname:"other.vercel.app"}},{challenge:{action:"login"}},{challengeThrow:true},{challengeStatus:500}]){
   const{post,calls}=load(options);const res=await post(req(input()));assert.ok([400,503].includes(res.status));assert.equal(calls.fetch.length,1);
 }
});
test("Resend rejection, ambiguous response and timeout never claim success",async()=>{
 for(const options of [{sendStatus:429},{sendStatus:500},{sendThrow:true},{receipt:{}}]){
   const{post}=load(options);assert.equal((await post(req(input()))).status,503);
 }
});
test("retry/new client key has identical provider idempotency and body; changed details get a new key",async()=>{
 const{post,calls}=load({replayed:true});
 const a=await post(req(input({key:"one"})));assert.equal((await a.json()).replayed,true);
 await post(req(input({key:"two",token:"fresh"})));
 await post(req(input({preferences:"Changed"})));
 const sends=calls.fetch.filter(x=>x.url.includes("resend"));
 assert.equal(sends[0].init.headers["Idempotency-Key"],sends[1].init.headers["Idempotency-Key"]);
 assert.equal(sends[0].init.body,sends[1].init.body);
 assert.notEqual(sends[1].init.headers["Idempotency-Key"],sends[2].init.headers["Idempotency-Key"]);
});
test("user content is plain text, never additional email headers or HTML",async()=>{
 const{post,calls}=load();
 await post(req(input({preferences:"<script>bad()</script>\nBcc: attacker@example.com",budget:1250.50,adults:2})));
 const email=JSON.parse(calls.fetch[1].init.body);
 assert.equal(email.html,undefined);assert.equal(email.bcc,undefined);assert.equal(email.cc,undefined);
 assert.match(email.text,/Budget per person \(USD\): 1250.5/);
});
test("release proxy blocks APIs, all legacy server actions, account and CRM without importing auth",()=>{
 const exports={};const next={NextResponse:class extends Response{static next(){return new Response(null,{status:200});}static redirect(url,status){return new Response(null,{status,headers:{Location:String(url)}});}}};
 vm.runInNewContext(compile(source("proxy.ts")),{exports,require(name){if(name==="next/server")return next;if(name==="./lib/i18n")return {isLocale:s=>["en","ru"].includes(s)};throw Error("Unexpected import");}});
 const request=(path,method="GET")=>({method,nextUrl:{pathname:path,clone:()=>new URL("https://test.vercel.app"+path)},cookies:{get:()=>undefined}});
 for(const path of ["/api/trip-requests","/api/inquiries","/api/internal/trip-request-notifications","/account","/admin","/en/account/login","/ru/admin"]){assert.equal(exports.proxy(request(path)).status,404);}
 for(const path of ["/en","/en/plan-your-trip","/en/about-emil","/en/tours/arbitrary.jpg"]){assert.equal(exports.proxy(request(path,"POST")).status,405);assert.equal(exports.proxy(request(path)).status,200);}
 assert.equal(exports.proxy(request("/api/email-leads","POST")).status,200);
});
