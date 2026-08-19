import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const viewCss = readFileSync(new URL('../src/client/MnemonView.module.css', import.meta.url), 'utf8')
const sidebarCss = readFileSync(new URL('../src/client/MnemonSidebarView.module.css', import.meta.url), 'utf8')
const saveActionCss = readFileSync(new URL('../src/client/MnemonSaveAction.module.css', import.meta.url), 'utf8')

describe('responsive dialog layout invariants', () => {
  it('keeps the dialog body as the only scrollport and the action footer outside it', () => {
    expect(viewCss).toContain('.modalBody { min-height: 0; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain;')
    expect(viewCss).toContain('.modalFooter { display: flex; flex: none;')
    expect(sidebarCss).toContain(".shell .modal > [class*='modalBody'] { min-height: 0; overflow-x: hidden; overflow-y: auto;")
    expect(sidebarCss).not.toContain('.shell .modal > div:last-child')
  })

  it('uses a safe-area-aware bottom sheet and touch-sized actions on narrow viewports', () => {
    expect(viewCss).toContain('.modalBackdrop { align-items: flex-end; padding: max(10px, env(safe-area-inset-top, 0px)) 0 0; }')
    expect(viewCss).toContain('.modal, .modalWide { width: 100vw;')
    expect(viewCss).toContain('max-height: calc(100dvh - max(10px, env(safe-area-inset-top, 0px)))')
    expect(viewCss).toContain('.modalFooterActions button { min-width: 0; min-height: 44px;')
    expect(sidebarCss).toContain('.shell .modal, .shell .modal.modalWide { width: 100vw;')
    expect(sidebarCss).toContain(".shell .modal > [class*='modalFooter'] [class*='modalFooterActions'] button { min-height: 44px;")
  })

  it('keeps dialog content and actions clear of landscape safe areas', () => {
    expect(viewCss).toContain('padding: 10px max(14px, env(safe-area-inset-right, 0px)) 12px max(14px, env(safe-area-inset-left, 0px));')
    expect(viewCss).toContain('padding: 14px max(14px, env(safe-area-inset-right, 0px)) 18px max(14px, env(safe-area-inset-left, 0px));')
    expect(sidebarCss).toContain(".shell .modal > [class*='modalFooter'] { padding: 10px max(14px, env(safe-area-inset-right, 0px))")
    expect(saveActionCss).toContain('max(12px, env(safe-area-inset-left, 0px))')
    expect(saveActionCss).toContain('max(12px, env(safe-area-inset-right, 0px))')
  })

  it('preserves body space by truncating descriptions in very short viewports', () => {
    expect(viewCss).toContain('@media (max-height: 420px)')
    expect(viewCss).toContain('.modal > header p { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }')
    expect(sidebarCss).toContain(".shell .modal > header p { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }")
  })

  it('bounds the conversation save dialog against dynamic and short viewports', () => {
    expect(saveActionCss).toContain('max-height: calc(100dvh - 16px);')
    expect(saveActionCss).toContain('min-height: clamp(140px, 32dvh, 220px);')
    expect(saveActionCss).toContain('min-height: 44px;')
  })
})
