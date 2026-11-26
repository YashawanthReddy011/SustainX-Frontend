import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const standaloneRoot = resolve('.next/standalone');

for (const relativePath of ['public', '.next/static']) {
  const source = resolve(relativePath);
  if (!existsSync(source)) continue;

  const destination = resolve(standaloneRoot, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}
