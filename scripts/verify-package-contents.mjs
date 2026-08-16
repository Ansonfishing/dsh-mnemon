import { spawnSync } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(npm, ['pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8' })
if (result.status !== 0) {
  process.stderr.write(result.stderr)
  process.exit(result.status ?? 1)
}

const [pack] = JSON.parse(result.stdout)
const paths = pack.files.map(file => file.path)
const required = ['package.json', 'cordis.patch.yml', 'lib/index.js', 'lib/client.js', 'lib/types/index.d.ts', 'lib/types/client/index.d.ts']
const allowedRootFiles = new Set(['package.json', 'cordis.patch.yml', 'LICENSE', 'README.md', 'README.zh-CN.md', 'SECURITY.md'])
const missing = required.filter(path => !paths.includes(path))
const unexpected = paths.filter(path => !allowedRootFiles.has(path) && !(/^lib\/.+\.(?:js|d\.ts)$/.test(path)))

if (missing.length > 0 || unexpected.length > 0 || pack.unpackedSize > 1_500_000) {
  if (missing.length > 0) console.error(`Missing package files:\n${missing.map(path => `- ${path}`).join('\n')}`)
  if (unexpected.length > 0) console.error(`Unexpected package files:\n${unexpected.map(path => `- ${path}`).join('\n')}`)
  if (pack.unpackedSize > 1_500_000) console.error(`Unpacked package is ${pack.unpackedSize} bytes; expected at most 1500000.`)
  process.exit(1)
}

console.log(`Verified package contents: ${pack.entryCount} files, ${pack.size} packed bytes, ${pack.unpackedSize} unpacked bytes.`)
