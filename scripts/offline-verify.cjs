/* Lightweight route-handler checks without network access. Vitest/Supertest/Newman remain required for full grading. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
let ts;
try { ts = require('typescript'); }
catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'); }
function fakeExpress() {
  return { routes: [], middlewares: [],
    use(route, fn) { if (typeof route === 'function') this.middlewares.push({route:'/',fn:route}); else this.middlewares.push({route,fn}); },
    post(route, fn) { this.routes.push({method:'POST',route,fn}); },
    get(route, fn) { this.routes.push({method:'GET',route,fn}); },
    delete(route, fn) { this.routes.push({method:'DELETE',route,fn}); },
  };
}
fakeExpress.json = () => (_req, _res, next) => next();
const source = fs.readFileSync(path.join(base, 'src/app.ts'),'utf8');
const code=ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022, esModuleInterop:true}}).outputText;
const exported = {exports:{}};
new Function('module','exports','require',code)(exported,exported.exports,(name)=>name==='express' ? fakeExpress : require(name));
const app = exported.exports.createApp();
function call(method, url, {headers={}, body=undefined}={}) {
  const cleanPath = new URL(url,'http://localhost').pathname;
  const hdr=Object.fromEntries(Object.entries(headers).map(([key,value])=>[key.toLowerCase(),value]));
  const req={body, params:{}, headers:hdr,header(n){return this.headers[n.toLowerCase()]},get(n){return this.headers[n.toLowerCase()]}};
  const res={locals:{}, statusCode:200, headers:{}, body:undefined, sent:false,
    status(n){this.statusCode=n;return this}, location(s){this.headers.location=s;return this},
    json(v){this.body=v;this.sent=true;return this},end(){this.sent=true;return this}};
  const routeParts=cleanPath.split('/');
  const middlewares=app.middlewares.filter(m=>cleanPath===m.route || cleanPath.startsWith(m.route.endsWith('/')?m.route:m.route+'/') || m.route==='/');
  function runMiddlewares(i=0) { if (i>=middlewares.length) return; let called=false; middlewares[i].fn(req,res,()=>{called=true});if(called)runMiddlewares(i+1); }
  runMiddlewares();
  if(!res.sent) {
    const route=app.routes.find(r=> r.method===method && r.route.split('/').length===routeParts.length && r.route.split('/').every((v,i)=>v.startsWith(':') || v===routeParts[i]));
    assert.ok(route,`Route not found: ${method} ${cleanPath}`);
    for(let i=0;i<routeParts.length;i++) if(route.route.split('/')[i].startsWith(':'))req.params[route.route.split('/')[i].slice(1)]=routeParts[i];
    route.fn(req,res);
  }
  return {status:res.statusCode,body:res.body,headers:res.headers};
}
let checked=0;
function check(label, f){try{f();checked++}catch(e){console.error(`FAIL: ${label}: ${e.message}`);process.exitCode=1}}
function auth(email='bob@example.com'){
 const r=call('POST','/auth/login',{body:{email,password:'Secret123'}});assert.equal(r.status,200);return r.body.accessToken;
}
const input={items:[{sku:'SKU-A',price:500,qty:1}]};
const bob=auth(),alice=auth('alice@example.com');
const create=(token, key, items=input.items)=>call('POST','/orders',{headers:{Authorization:`Bearer ${token}`, ...(key!==undefined?{'Idempotency-Key':key}:{})},body:{items}});
check('401 unauthenticated',()=>assert.equal(create('wrong','X').status,401));
check('201 new order',()=>assert.equal(create(bob,'manual-key').status,201));
const initial=create(bob,'shared-key');
check('200 repeated request',()=>assert.equal(create(bob,'shared-key').status,200));
check('replay same id',()=>assert.equal(create(bob,'shared-key').body.id,initial.body.id));
check('409 changed payload',()=>assert.equal(create(bob,'shared-key',[{sku:'B',price:700,qty:1}]).status,409));
check('400 empty key',()=>assert.equal(create(bob,' ',input.items).status,400));
check('400 empty order',()=>assert.equal(create(bob,undefined,[]).status,400));
check('400 invalid qty',()=>assert.equal(create(bob,undefined,[{sku:'B',price:700,qty:0}]).status,400));
check('400 invalid price',()=>assert.equal(create(bob,undefined,[{sku:'B',price:-10,qty:1}]).status,400));
check('400 invalid SKU',()=>assert.equal(create(bob,undefined,[{sku:'',price:10,qty:1}]).status,400));
check('200 user reading own order',()=>assert.equal(call('GET',`/orders/${initial.body.id}`,{headers:{Authorization:`Bearer ${bob}`}}).status,200));
check('404 foreign user',()=>assert.equal(call('GET',`/orders/${initial.body.id}`,{headers:{Authorization:`Bearer ${alice}`}}).status,404));
check('201 same key different users',()=>assert.equal(create(alice,'shared-key').status,201));
check('204 delete and 404 repeated',()=>{const req={headers:{Authorization:`Bearer ${bob}`}};assert.equal(call('DELETE',`/orders/${initial.body.id}`,req).status,204);assert.equal(call('DELETE',`/orders/${initial.body.id}`,req).status,404)});
check('201 reuse key after delete',()=>assert.equal(create(bob,'shared-key').status,201));

const postman=JSON.parse(fs.readFileSync(path.join(base,'postman/orders.postman_collection.json'),'utf8'));
const variables=new Map((postman.variable||[]).map(v=>[v.key,v.value]));
function replace(value){return String(value).replace(/\{\{([^{}]+)\}\}/g,(_m,k)=>String(variables.get(k)||''))}
let checksPostman=0;
function runCollection(iteration) {
  for(const item of postman.item) {
    const q=item.request, headers=Object.fromEntries((q.header||[]).map(h=>[h.key,replace(h.value)]));
    const url=replace(q.url.raw), body=q.body&&q.body.mode==='raw'?JSON.parse(replace(q.body.raw)):undefined;
    const response=call(q.method,url,{headers,body});
    const pm={
      response:{code:response.status,status:response.status,json(){return response.body}, to:{have:{status(v){assert.equal(response.status,v)}}}},
      collectionVariables:{get(k){return variables.get(k)},set(k,v){variables.set(k,v)}},
      expect(actual){return {to:{eql(expected){assert.deepEqual(actual,expected)},have:{lengthOf(expected){assert.equal(actual.length,expected)}}}}},
      test(label,fn){try{fn();checksPostman++}catch(e){throw new Error(`Round ${iteration}, ${item.name}, ${label}: ${e.message}`)}}
    };
    const js=(item.event||[]).filter(e=>e.listen==='test').map(e=>e.script.exec.join('\n')).join('\n');
    vm.runInNewContext(js,{pm,Date,Math},{timeout:2000});
  }
}
try {runCollection(1);runCollection(2);check('Postman collection repeated twice on same server',()=>assert.ok(checksPostman>=22));}
catch(e) { console.error('FAIL Postman: '+e.message);process.exitCode=1 }
console.log(`Route-handler checks: ${checked}/16. Postman assertions (2 runs): ${checksPostman}.`);
if(process.exitCode)process.exit(process.exitCode);
