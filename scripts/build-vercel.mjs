import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const vercelOut = path.join(rootDir, '.vercel', 'output');
const funcDir = path.join(vercelOut, 'functions', 'api.func');
const staticDir = path.join(vercelOut, 'static');

// Ensure output directories exist
fs.mkdirSync(funcDir, { recursive: true });
fs.mkdirSync(staticDir, { recursive: true });

// ── 1. Build the API serverless function ────────────────────────────────────
await esbuild.build({
  entryPoints: [path.join(rootDir, 'api', 'index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outfile: path.join(funcDir, 'index.js'),
  external: ['pg-native'],
  alias: {
    '@db': path.join(rootDir, 'db'),
    '@contracts': path.join(rootDir, 'contracts'),
    'db': path.join(rootDir, 'db'),
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
  minify: true,
  sourcemap: false,
});
console.log('✅ API serverless function built');

// Vercel serverless function runtime config
fs.writeFileSync(
  path.join(funcDir, '.vc-config.json'),
  JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.js' }, null, 2)
);

// ── 2. Copy Vite frontend build to static output ─────────────────────────────
// Without this step the frontend (dist/) is never deployed — Vercel only serves
// files from .vercel/output/static/ when using the Build Output API (v3).
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  throw new Error(
    '`dist/` not found. Make sure `vite build` ran before this script.'
  );
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(distDir, staticDir);
console.log('✅ Frontend static files copied to .vercel/output/static/');

// ── 3. Build Output API routing config ───────────────────────────────────────
// Without explicit routes here, Vercel won't:
//   • Route /api/* to the serverless function
//   • Fall back to index.html for SPA client-side navigation
fs.writeFileSync(
  path.join(vercelOut, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // All /api/* requests → serverless function
        {
          src: '^/api(/.*)?$',
          dest: '/api',
        },
        // Static assets (hashed filenames — aggressive cache)
        {
          src: '^/assets/(.*)$',
          headers: { 'cache-control': 'public, max-age=31536000, immutable' },
          dest: '/assets/$1',
        },
        // SPA fallback — every other path serves index.html so React Router works
        {
          src: '^/(.*)$',
          dest: '/index.html',
        },
      ],
    },
    null,
    2
  )
);
console.log('✅ Vercel routing config written');

console.log('\n🚀 Vercel build output ready at', vercelOut);
