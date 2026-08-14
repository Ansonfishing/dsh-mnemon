import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const sidebarCss = readFileSync(new URL('../src/client/MnemonSidebarView.module.css', import.meta.url), 'utf8')

describe('Sidebar layout invariants', () => {
  it('pins primary page headers at the canvas origin without an initial sticky settling distance', () => {
    expect(sidebarCss).toContain(".shell .canvas[data-lock-page-header] [class*='pageHeader'] {\n  position: sticky;\n  z-index: 12;\n  top: 0;")
    expect(sidebarCss).not.toContain("top: -14px")
  })

  it('keeps the connected label visible in the compact Sidebar header', () => {
    expect(sidebarCss).toContain(".shell .statusCluster > span:not([class*='statusDot']) { display: inline; }")
  })
})
