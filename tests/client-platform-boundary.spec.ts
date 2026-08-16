import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('browser bundle platform boundary', () => {
  it('routes every Client parent import through the shared contract', () => {
    const directory = new URL('../src/client/', import.meta.url)
    const directoryPath = fileURLToPath(directory)
    const violations = readdirSync(directory, { recursive: true })
      .filter(path => /\.[jt]sx?$/.test(String(path)))
      .flatMap(path => {
        const source = readFileSync(join(directoryPath, String(path)), 'utf8')
        return [...source.matchAll(/(?:from|import)\s*['"](\.\.\/[^'"]+)['"]/gu)]
          .map(match => `${String(path)}: ${match[1]}`)
      })
      .filter(imported => !imported.endsWith('../shared/contracts.ts'))
    expect(violations).toEqual([])
  })

  it('keeps the shared browser contract free of Node runtime imports', () => {
    const contract = readFileSync(new URL('../src/shared/contracts.ts', import.meta.url), 'utf8')
    expect(contract).not.toMatch(/from\s*['"]node:/u)
  })
})
