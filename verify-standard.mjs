#!/usr/bin/env node
// verify-standard.mjs: zero-dependency, best-effort static scan for Industry_Standard.md §3.2.
// Usage: node verify-standard.mjs [project-dir]   (exit code 1 if any [FAIL])
// A pass does NOT prove the app is secure. RLS, rate limiting, webhooks and tenant isolation need manual review.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const root = process.argv[2] || process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.svelte-kit', 'coverage', '.turbo', '.vercel']);
const CODE_EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.html', '.php', '.py', '.rb']);
const ENV_EXT_RE = /(^|\/)\.env(\.[\w.-]+)?$/;

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) walk(full); }
    else files.push(full);
  }
})(root);

const rel = (f) => relative(root, f).split('\\').join('/');
const read = (f) => { try { return readFileSync(f, 'utf8'); } catch { return ''; } };
const codeFiles = files.filter((f) => CODE_EXT.has(extname(f)) && rel(f) !== 'verify-standard.mjs');
const isWebProject = existsSync(join(root, 'package.json')) || codeFiles.length > 0;

const results = [];
const add = (status, name, detail) => results.push({ status, name, detail });

// 1. .env ignored by git
{
  const gi = join(root, '.gitignore');
  if (!existsSync(gi)) {
    const hasEnv = files.some((f) => ENV_EXT_RE.test(rel(f)));
    add(hasEnv ? 'FAIL' : 'SKIP', '.env gitignored', hasEnv ? 'env file present but no .gitignore' : 'no .gitignore and no env files');
  } else {
    const ok = read(gi).split(/\r?\n/).some((l) => /^\/?\.env(\*|\.\*)?\/?$/.test(l.trim()));
    add(ok ? 'PASS' : 'FAIL', '.env gitignored', ok ? '.gitignore ignores .env' : '.gitignore does not list .env');
  }
}

// 2. Private secrets with public prefixes
{
  const re = /\b(NEXT_PUBLIC|VITE|PUBLIC|REACT_APP|NUXT_PUBLIC)_[A-Z0-9_]*(SECRET|PRIVATE|SERVICE_ROLE|PASSWORD|DATABASE_URL|DB_URL)[A-Z0-9_]*/g;
  const hits = [];
  for (const f of files) {
    const r = rel(f);
    if (!(CODE_EXT.has(extname(f)) || ENV_EXT_RE.test(r) || r.endsWith('.env.example'))) continue;
    read(f).split(/\r?\n/).forEach((line, i) => {
      if (re.test(line)) hits.push(`${r}:${i + 1}`);
      re.lastIndex = 0;
    });
  }
  add(hits.length ? 'FAIL' : 'PASS', 'no public-prefixed secrets', hits.length ? hits.slice(0, 10).join(', ') : 'none found');
}

// 3. Security headers
if (!isWebProject) {
  add('SKIP', 'security headers', 'no web project detected');
} else {
  const blob = files
    .filter((f) => /(next\.config|middleware|vercel\.json|netlify\.toml|_headers|server|app)\.[\w.]+$/i.test(rel(f)) || /(^|\/)(middleware|config)\//i.test(rel(f)))
    .map(read).join('\n').toLowerCase();
  const needed = ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'content-security-policy'];
  const missing = needed.filter((h) => !blob.includes(h));
  add(missing.length ? 'FAIL' : 'PASS', 'security headers', missing.length ? `missing: ${missing.join(', ')}` : 'all 5 present in config/middleware');
}

// 4. dangerouslySetInnerHTML and SQL concatenation
{
  const sqlConcat = /\b(select|insert|update|delete)\b[^;\n]{0,200}(["'`]\s*\+\s*\w|\$\{)/i;
  const dsih = [], sql = [];
  for (const f of codeFiles) {
    const r = rel(f);
    if (r === 'verify-standard.mjs') continue;
    const text = read(f);
    text.split(/\r?\n/).forEach((line, i) => {
      if (line.includes('dangerouslySetInnerHTML') && !/DOMPurify|sanitize/i.test(text)) dsih.push(`${r}:${i + 1}`);
      if (/\.(query|execute|raw|\$queryRawUnsafe|\$executeRawUnsafe)\s*\(/.test(line) && sqlConcat.test(line)) sql.push(`${r}:${i + 1}`);
    });
  }
  add(dsih.length ? 'FAIL' : 'PASS', 'no unsanitized dangerouslySetInnerHTML', dsih.length ? dsih.slice(0, 10).join(', ') : 'none found');
  add(sql.length ? 'FAIL' : 'PASS', 'no SQL string concatenation (heuristic)', sql.length ? sql.slice(0, 10).join(', ') : 'none found');
}

for (const r of results) console.log(`[${r.status}] ${r.name}: ${r.detail}`);
console.log('\nNot checked (mark [NOT VERIFIED] unless inspected manually): RLS, rate limiting, webhook signatures, tenant isolation, MFA, CDN cache headers.');
process.exit(results.some((r) => r.status === 'FAIL') ? 1 : 0);
