import fs from 'fs';
import path from 'path';

const root = path.resolve(new URL(import.meta.url).pathname, '../../..');
const repoRoot = path.resolve(root);
const src = path.join(repoRoot, 'SuperProfes-Design-System');
const dest = path.join(process.cwd(), 'public', 'design-system');

function copyRecursive(srcPath, destPath) {
  if (!fs.existsSync(srcPath)) return;
  fs.mkdirSync(destPath, { recursive: true });
  for (const entry of fs.readdirSync(srcPath, { withFileTypes: true })) {
    const srcEntry = path.join(srcPath, entry.name);
    const destEntry = path.join(destPath, entry.name);
    if (entry.isDirectory()) copyRecursive(srcEntry, destEntry);
    else if (entry.isFile()) fs.copyFileSync(srcEntry, destEntry);
  }
}

console.log('Copying SuperProfes-Design-System →', dest);
if (!fs.existsSync(src)) {
  console.warn('Design system source folder not found at', src);
  process.exit(0);
}
copyRecursive(src, dest);
console.log('Copy complete');
