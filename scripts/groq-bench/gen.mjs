// Builds old (base ref) vs new (working tree) query strings for bench.mjs.
// usage: node --experimental-strip-types scripts/groq-bench/gen.mjs [baseRef=origin/staging]
import * as U from '../../src/sanity/lib/groqUtils.ts';
import fs from 'fs';
import { execSync } from 'child_process';
const base = process.argv[2] || 'origin/staging';
const FILE = 'src/sanity/lib/getProducts.ts';
const sources = { old: execSync(`git show ${base}:${FILE}`, { encoding: 'utf8' }), new: fs.readFileSync(FILE, 'utf8') };
const fns = ['getProductsByBrand','getRelatedProducts'];
function extract(src, fn){
  const start = src.indexOf(`export async function ${fn}(`);
  const end = src.indexOf('export async function', start+10);
  const body = src.slice(start, end<0?undefined:end);
  const out=[];
  // baseFilter const for brand
  const bf = body.match(/const baseFilter = `([\s\S]*?)`;/);
  const re = /defineQuery\(`([\s\S]*?)`\)/g; let m;
  while((m=re.exec(body))) out.push(m[1]);
  return out.map(q=>{
    let s=q;
    if(bf) s=s.replace('${baseFilter}', bf[1]);
    s=s.replace(/\$\{genderFilter\}/g,'').replace(/\$\{buildLimitClause\(limit\)\}/g,'').replace(/\$\{limit\}/g,'12');
    s=s.replace(/\$\{([A-Z_]+)\}/g,(_,k)=>U[k]);
    if(/\$\{/.test(s)) throw new Error('unresolved '+fn+': '+s.match(/\$\{[^}]+\}/)[0]);
    return s;
  });
}
const res={};
for (const v of ['old','new']){
  const src=sources[v];
  res[v]={};
  for(const f of fns) res[v][f]=extract(src,f);
}
const cases=[
 {name:'brand products (arcteryx)', fn:'getProductsByBrand', i:0, params:{brandSlug:'arcteryx'}},
 {name:'related by brand (arcteryx)', fn:'getRelatedProducts', i:0, params:{brandSlug:'arcteryx',excludeId:'x'}},
];
const out=cases.map(c=>({name:c.name, params:c.params, old:res.old[c.fn][c.i], new:res.new[c.fn][c.i]}));
fs.writeFileSync('scripts/groq-bench/cases.json', JSON.stringify(out,null,1));
console.log(out.map(o=>o.name+' old='+o.old.length+' new='+o.new.length).join('\n'));
