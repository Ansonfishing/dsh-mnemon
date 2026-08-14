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

  it('renders runtime metadata as real chips while keeping form values at normal weight', () => {
    expect(sidebarCss).toContain(".shell [class*='runtimeEntryBadges'] > span {")
    expect(sidebarCss).toContain('border-radius: 999px;')
    expect(sidebarCss).toContain(".shell [class*='runtimeEntryBadges'] > [class*='runtimeEntryTarget'] {")
    expect(sidebarCss).toContain(".shell textarea { font-family: var(--dsw-font-family); font-size: 13px; font-weight: 400; }")
    expect(sidebarCss).toContain('.shell select { cursor: pointer; font-weight: 400; }')
  })

  it('keeps every memory-space footer on one aligned row', () => {
    expect(sidebarCss).toContain(".shell [class*='bodyGrid'] {\n  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));")
    expect(sidebarCss).toContain('grid-template-columns: minmax(max-content, 1fr) max-content;')
    expect(sidebarCss).toContain(".shell .bodyCardFooter {\n  display: grid;")
    expect(sidebarCss).toContain('white-space: nowrap;')
    expect(sidebarCss).toContain(".shell .bodyCardStats {\n  display: flex;\n  min-width: max-content;\n  flex-wrap: nowrap;")
  })
})
