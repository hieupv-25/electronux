// Load the existing TypeScript sources and generated Prisma client for Node's
// integration runner. Production compilation remains Next.js's responsibility.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function resolve(specifier, context, nextResolve) {
  let candidate;
  if (specifier.startsWith('@/')) candidate = pathToFileURL(path.join(root, 'src', specifier.slice(2))).href;
  else if (specifier.startsWith('.') && context.parentURL?.endsWith('.ts')) candidate = new URL(specifier, context.parentURL).href;
  if (candidate) {
    for (const suffix of ['', '.ts']) {
      try { await fs.access(fileURLToPath(candidate + suffix)); return { url: candidate + suffix, shortCircuit: true }; } catch { /* try extension */ }
    }
  }
  return nextResolve(specifier, context);
}
export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts')) {
    const source = await fs.readFile(fileURLToPath(url), 'utf8');
    return { format: 'module', shortCircuit: true, source: ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }, fileName: fileURLToPath(url),
    }).outputText };
  }
  return nextLoad(url, context);
}
