// Times old vs new GROQ against api.sanity.io (uncached, what the app uses) and
// checks both return identical results. Uses the server-reported `ms`.
// usage: node scripts/groq-bench/bench.mjs scripts/groq-bench/cases.json .env.local [runs]
import fs from 'fs';
const [,, casesPath, envPath, runsArg] = process.argv;
const env = Object.fromEntries(fs.readFileSync(envPath,'utf8').split('\n').filter(l=>/^[A-Z_]+=/.test(l)).map(l=>{const i=l.indexOf('=');return [l.slice(0,i), l.slice(i+1).replace(/^["']|["']$/g,'')]}));
const pid = env.NEXT_PUBLIC_SANITY_PROJECT_ID || env.SANITY_STUDIO_SANITY_PROJECT_ID;
const ds = env.NEXT_PUBLIC_SANITY_DATASET || env.SANITY_STUDIO_SANITY_DATASET;
const token = env.SANITY_API_READ_TOKEN;
const runs = Number(runsArg||7);
const cases = JSON.parse(fs.readFileSync(casesPath,'utf8'));
async function q(query, params){
  const t0=performance.now();
  const r = await fetch(`https://${pid}.api.sanity.io/v2025-06-12/data/query/${ds}?perspective=published`, {method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${token}`}, body: JSON.stringify({query, params})});
  const j = await r.json();
  if (j.error) throw new Error(JSON.stringify(j.error).slice(0,300));
  return {wall: performance.now()-t0, server: j.ms, body: JSON.stringify(j.result)};
}
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
const rows=[];
for (const c of cases){
  const r={old:{wall:[],server:[]},new:{wall:[],server:[]}}; let bo,bn;
  for(let i=0;i<runs;i++){
    for (const v of (i%2?['new','old']:['old','new'])){
      const x=await q(c[v], c.params); r[v].wall.push(x.wall); r[v].server.push(x.server);
      if(v==='old') bo=x.body; else bn=x.body;
    }
  }
  rows.push(`| ${c.name} | ${med(r.old.server)} | ${med(r.new.server)} | ${Math.round(med(r.old.wall))} | ${Math.round(med(r.new.wall))} | ${bo.length} | ${bn.length} | ${bo===bn?'identical':'DIFFERENT'} |`);
}
console.log(`runs=${runs}, api.sanity.io (uncached), median\n| query | old server ms | new server ms | old wall ms | new wall ms | old bytes | new bytes | result |\n|---|---|---|---|---|---|---|---|\n`+rows.join('\n'));
