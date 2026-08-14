import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('browser bundle platform boundary', () => {
  it('never bundles Host-only Node modules into the DSH client loader', () => {
    const bundle = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
    expect(bundle).not.toMatch(/require\(["']node:/)
    expect(bundle).not.toContain('#region src/version-updates.ts')
    expect(bundle).not.toContain('#region src/rpc.ts')
  })
})
