import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const excluded = new Set(['./client', './package.json'])
const entries = Object.entries(manifest.exports)
  .filter(([subpath]) => !excluded.has(subpath))
  .map(([subpath, descriptor]) => {
    if (typeof descriptor !== 'object' || descriptor === null || typeof descriptor.default !== 'string' || typeof descriptor.types !== 'string') {
      throw new Error(`public export ${subpath} must declare default and types paths`)
    }
    return { subpath, defaultPath: descriptor.default, typesPath: descriptor.types }
  })

for (const entry of entries) {
  const runtimePath = resolve(root, entry.defaultPath)
  const typesPath = resolve(root, entry.typesPath)
  if (!existsSync(runtimePath)) throw new Error(`public export ${entry.subpath} is missing runtime file ${entry.defaultPath}`)
  if (!existsSync(typesPath)) throw new Error(`public export ${entry.subpath} is missing declarations ${entry.typesPath}`)
  await import(`${pathToFileURL(runtimePath).href}?verify=${encodeURIComponent(entry.subpath)}`)
}

console.log(`Imported ${entries.length} Node-compatible public entries on ${process.version}.`)
