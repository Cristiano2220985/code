import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export function smartPantryPwa() {
  let publicDir

  return {
    name: 'smartpantry-pwa',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      publicDir = config.publicDir
    },
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        const worker = readFileSync(new URL('./service-worker.js', import.meta.url), 'utf8')
        const manifestFile = 'manifest.webmanifest'
        const manifest = readFileSync(join(publicDir, manifestFile), 'utf8')
        const publicFiles = [
          manifestFile,
          'favicon.ico',
          ...JSON.parse(manifest).icons.map(({ src }) => src),
        ]
        const builtFiles = Object.keys(bundle).filter((name) => !name.endsWith('.map'))
        const files = [...new Set([...builtFiles, ...publicFiles])].sort()
        const hash = createHash('sha256').update(worker)

        for (const file of files) {
          const output = bundle[file]
          hash.update(file)
          if (output) hash.update(output.type === 'chunk' ? output.code : output.source)
          else hash.update(readFileSync(join(publicDir, file)))
        }

        const settings = JSON.stringify({ version: hash.digest('hex'), files })
        this.emitFile({
          type: 'asset',
          fileName: 'sw.js',
          source: `const precache = ${settings}\n${worker}`,
        })
      },
    },
  }
}
