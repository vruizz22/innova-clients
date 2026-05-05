#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(currentDir, '..')
const sourceDir = path.join(repoRoot, 'SuperProfes-Design-System')
const targetDir = path.resolve(process.argv[2] ?? path.join(process.cwd(), 'public', 'design-system'))

function copyDirectory(sourcePath, targetPath) {
  fs.mkdirSync(targetPath, { recursive: true })

  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    const sourceEntry = path.join(sourcePath, entry.name)
    const targetEntry = path.join(targetPath, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourceEntry, targetEntry)
      continue
    }

    if (entry.isFile()) {
      if (entry.name.endsWith('.ts')) {
        continue
      }

      fs.copyFileSync(sourceEntry, targetEntry)
    }
  }
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Design system folder not found: ${sourceDir}`)
  process.exit(1)
}

copyDirectory(sourceDir, targetDir)
console.log(`Copied design system to ${targetDir}`)
