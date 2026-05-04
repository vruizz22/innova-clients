#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const target = process.argv[2] ?? '.'
const root = path.resolve(process.cwd(), target)
const exts = ['.html', '.astro', '.css', '.js', '.ts', '.jsx', '.tsx']

function walk(dir) {
    const files = []
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name)
        if (ent.isDirectory()) files.push(...walk(p))
        else if (exts.includes(path.extname(ent.name))) files.push(p)
    }
    return files
}

function checkFile(file) {
    const content = fs.readFileSync(file, 'utf8')
    const relPattern = /(?:href|src)=\"(\.\/|\.\.\/)/g
    const importPattern = /import\s+.*from\s+['\"](\.\/|\.\.\/)/g
    if (relPattern.test(content) || importPattern.test(content)) return true
    return false
}

const files = walk(root)
const violations = []
for (const f of files) {
    if (checkFile(f)) violations.push(path.relative(process.cwd(), f))
}

if (violations.length > 0) {
    console.error('Relative path violations found (use absolute routes starting with /):')
    for (const v of violations) console.error(' -', v)
    process.exit(2)
}
console.log('No relative path violations found in', target)
