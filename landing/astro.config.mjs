import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    site: 'https://superprofes.app',
    integrations: [
        tailwind({
            configFile: './tailwind.config.cjs',
        }),
    ],
    vite: {
        resolve: {
            alias: {
                '@design': resolve(currentDir, '../SuperProfes-Design-System/index.ts'),
                '@design/': resolve(currentDir, '../SuperProfes-Design-System/') + '/',
            },
        },
    }
})
