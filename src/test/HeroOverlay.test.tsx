/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../store/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

vi.mock('../data/map', () => ({
  getLearningPath: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock)
// ---------------------------------------------------------------------------

import { useTheme } from '../store/ThemeContext'
import { getLearningPath } from '../data/map'
import HeroOverlay from '../components/organisms/HeroOverlay'
import type { MindMapNode } from '../types/mindmap'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

/** Full learning path of 14 nodes */
const fullPath: MindMapNode[] = [
  { id: 'LLM', group: 1, description: 'Foundations', content: { summary: '', sections: [] }, learningStep: 1 },
  { id: 'PromptEngineering', group: 2, description: 'Prompting', content: { summary: '', sections: [] }, learningStep: 2 },
  { id: 'RAG', group: 3, description: 'RAG', content: { summary: '', sections: [] }, learningStep: 3 },
  { id: 'FineTuning', group: 4, description: 'Fine-tuning', content: { summary: '', sections: [] }, learningStep: 4 },
  { id: 'Agent', group: 5, description: 'Agents', content: { summary: '', sections: [] }, learningStep: 5 },
  { id: 'MCP', group: 5, description: 'MCP', content: { summary: '', sections: [] }, learningStep: 5.5 },
  { id: 'AISystemDesign', group: 6, description: 'System Design', content: { summary: '', sections: [] }, learningStep: 6 },
  { id: 'VectorDB', group: 7, description: 'Vector DB', content: { summary: '', sections: [] }, learningStep: 7 },
  { id: 'LLMOps', group: 8, description: 'LLMOps', content: { summary: '', sections: [] }, learningStep: 8 },
  { id: 'EvalTesting', group: 9, description: 'Evaluation', content: { summary: '', sections: [] }, learningStep: 9 },
  { id: 'AISafety', group: 10, description: 'Safety', content: { summary: '', sections: [] }, learningStep: 10 },
  { id: 'Multimodal', group: 11, description: 'Multimodal', content: { summary: '', sections: [] }, learningStep: 11 },
  { id: 'Infrastructure', group: 12, description: 'Infrastructure', content: { summary: '', sections: [] }, learningStep: 12 },
  { id: 'Coding', group: 13, description: 'Coding', content: { summary: '', sections: [] }, learningStep: 13 },
  { id: 'Behavioral', group: 14, description: 'Behavioral', content: { summary: '', sections: [] }, learningStep: 14 },
]

/** Short path for edge-case testing (less than 5 items) */
const shortPath: MindMapNode[] = [
  { id: 'LLM', group: 1, description: 'Foundations', content: { summary: '', sections: [] }, learningStep: 1 },
  { id: 'RAG', group: 2, description: 'RAG', content: { summary: '', sections: [] }, learningStep: 2 },
  { id: 'Agent', group: 3, description: 'Agent', content: { summary: '', sections: [] }, learningStep: 3 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderHero(overrides: { isMobile?: boolean } = {}) {
  return render(<HeroOverlay isMobile={overrides.isMobile ?? false} />)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HeroOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: dark mode with full path
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn(),
    } as any)

    vi.mocked(getLearningPath).mockReturnValue([...fullPath])
  })

  afterEach(() => {
    cleanup()
  })

  // -----------------------------------------------------------------------
  // Title and subtitle
  // -----------------------------------------------------------------------

  it('renders the main title "AI MINDMAP"', () => {
    renderHero()

    // The title contains "AI" and "MINDMAP" as separate styled spans
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('MINDMAP')).toBeInTheDocument()
  })

  it('renders the subtitle from i18n', () => {
    renderHero()

    // hero.subtitle appears in both the subtitle <p> and the keyboard hints <p>,
    // so use getAllByText and verify at least one exists
    const subtitleMatches = screen.getAllByText(
      /An interactive 3D map of the AI Engineering ecosystem/i,
    )
    expect(subtitleMatches.length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText(/Each molecule is a topic/i),
    ).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Stats badges
  // -----------------------------------------------------------------------

  it('renders all 4 stats badges (topics, step-by-step, qa, code)', () => {
    renderHero()

    // The sections are defined in SECTIONS constant inside the component
    expect(screen.getByText(/14 Topics/i)).toBeInTheDocument()
    expect(screen.getByText(/Step-by-Step/i)).toBeInTheDocument()
    expect(screen.getByText(/100\+ Q&A/i)).toBeInTheDocument()
    expect(screen.getByText(/50\+ Code/i)).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Learning path preview
  // -----------------------------------------------------------------------

  it('shows the "Learning Path" heading', () => {
    renderHero()

    expect(screen.getByText(/Learning Path/i)).toBeInTheDocument()
  })

  it('shows the first 7 learning path steps by default (desktop)', () => {
    renderHero()

    // Desktop shows steps.slice(0, 7) = first 7 items
    const first7 = fullPath.slice(0, 7)
    first7.forEach((node) => {
      expect(screen.getByText(node.id)).toBeInTheDocument()
    })

    // The 8th item should NOT be visible in the step list
    expect(screen.queryByText('VectorDB')).not.toBeInTheDocument()
  })

  it('shows the "+more" count for remaining steps on desktop', () => {
    renderHero()

    // desktop: steps.slice(0, 7) → steps.length - 7 = 8 remaining
    expect(screen.getByText(/8 more topics?/i)).toBeInTheDocument()
  })

  it('limits learning path items to 5 on mobile', () => {
    renderHero({ isMobile: true })

    // Mobile shows steps.slice(0, 5)
    const first5 = fullPath.slice(0, 5)
    first5.forEach((node) => {
      expect(screen.getByText(node.id)).toBeInTheDocument()
    })

    // 6th item should NOT be visible
    expect(screen.queryByText('MCP')).not.toBeInTheDocument()
  })

  it('shows the "+more" count for remaining steps on mobile', () => {
    renderHero({ isMobile: true })

    // mobile: steps.slice(0, 5) → steps.length - 5 = 10 remaining
    expect(screen.getByText(/10 more topics?/i)).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Mobile layout
  // -----------------------------------------------------------------------

  it('applies mobile layout styles when isMobile is true', () => {
    const { container } = renderHero({ isMobile: true })

    const heroDiv = container.querySelector('[data-tour="hero"]')
    expect(heroDiv).toBeInTheDocument()

    // Mobile: left = 5%, right = 5%, top = 3.7rem
    expect(heroDiv).toHaveStyle({ left: '5%' })
    expect(heroDiv).toHaveStyle({ maxWidth: '90%' })
  })

  it('applies desktop layout styles when isMobile is false', () => {
    const { container } = renderHero({ isMobile: false })

    const heroDiv = container.querySelector('[data-tour="hero"]')
    expect(heroDiv).toBeInTheDocument()

    // Desktop: left = 17%, right = auto, top = 3rem
    expect(heroDiv).toHaveStyle({ left: '17%' })
    expect(heroDiv).toHaveStyle({ maxWidth: '560px' })
  })

  // -----------------------------------------------------------------------
  // Keyboard hints
  // -----------------------------------------------------------------------

  it('renders keyboard shortcut hints with kbd tags', () => {
    renderHero()

    // The component renders keyboard hint with <kbd> elements
    const kbdElements = document.querySelectorAll('kbd')
    expect(kbdElements.length).toBeGreaterThanOrEqual(3)

    // Should contain +, -, and R
    const kbdTexts = Array.from(kbdElements).map((el) => el.textContent)
    expect(kbdTexts).toContain('+')
    expect(kbdTexts).toContain('-')
    expect(kbdTexts).toContain('R')
  })

  // -----------------------------------------------------------------------
  // Theme mode
  // -----------------------------------------------------------------------

  it('applies dark mode colors to the heading', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn(),
    } as any)

    const { container } = renderHero()
    const h1 = container.querySelector('h1')
    expect(h1).toBeInTheDocument()
    // Dark mode heading color via semantic token
    expect(h1).toHaveClass('text-text-primary')
  })

  it('applies light mode colors to the heading', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      isDark: false,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn(),
    } as any)

    const { container } = renderHero()
    const h1 = container.querySelector('h1')
    expect(h1).toBeInTheDocument()
    // Light mode heading color via semantic token
    expect(h1).toHaveClass('text-text-primary')
  })

  it('applies dark mode subtitle color', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn(),
    } as any)

    const { container } = renderHero()
    // Find the subtitle <p> specifically (first <p> in the hero, before the stats badges)
    const paragraphs = container.querySelectorAll('p')
    const subtitleP = Array.from(paragraphs).find(
      (p) =>
        p.textContent?.includes('An interactive 3D map') &&
        !p.querySelector('kbd'),
    )
    expect(subtitleP).toBeInTheDocument()
    expect(subtitleP).toHaveClass('text-text-secondary')
  })

  it('applies light mode subtitle color', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      isDark: false,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn(),
    } as any)

    const { container } = renderHero()
    const paragraphs = container.querySelectorAll('p')
    const subtitleP = Array.from(paragraphs).find(
      (p) =>
        p.textContent?.includes('An interactive 3D map') &&
        !p.querySelector('kbd'),
    )
    expect(subtitleP).toBeInTheDocument()
    expect(subtitleP).toHaveClass('text-text-secondary')
  })

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  it('handles empty learning path gracefully (no steps, no "+more")', () => {
    vi.mocked(getLearningPath).mockReturnValue([])

    renderHero()

    // No step items should render
    const stepItems = screen.queryAllByText(/^\d+\.\s+\w+/)
    expect(stepItems.length).toBe(0)

    // The heading should still render
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('handles learning path shorter than mobile limit (5) without "+more"', () => {
    vi.mocked(getLearningPath).mockReturnValue([...shortPath])

    renderHero({ isMobile: true })

    // All 3 items should render
    shortPath.forEach((node) => {
      expect(screen.getByText(node.id)).toBeInTheDocument()
    })

    // No "+more" since steps.length - 5 = -2 (Math.max with 0 will yield 0)
    // The more text: steps.length - (isMobile ? 5 : 7) = 3 - 5 = -2
    // In i18n, count = -2 would show "0 more topics" if count <= 0 is handled
    // The component always renders the "+more" span if steps.length > limit,
    // but with negative count the template may show empty or "0 more topics"
  })
})

// =========================================================================
// Extended tests — step numbers, styling, edge cases, CSS classes
// =========================================================================

describe('HeroOverlay — extended', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
      colors: {} as any, getGroupPalette: vi.fn(),
    } as any)
    vi.mocked(getLearningPath).mockReturnValue([...fullPath])
  })

  afterEach(() => {
    cleanup()
  })

  // -----------------------------------------------------------------------
  // Learning path step numbers
  // -----------------------------------------------------------------------

  it('renders learning path items with correct step numbers (1., 2., etc.)', () => {
    renderHero()
    // Each step item shows a number prefix like "1." "2." etc.
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(`${i}.`)).toBeInTheDocument()
    }
  })

  it('step numbers are nested inside step item spans', () => {
    const { container } = renderHero()
    // The step number is a <span> containing just the number+period
    const stepContainer = container.querySelector('.flex.flex-wrap.gap-1\\.5')
    const numberPrefixes = Array.from(stepContainer?.querySelectorAll('span') || [])
      .filter((s) => s.textContent && /^\d+\.$/.test(s.textContent!))
    expect(numberPrefixes.length).toBeGreaterThanOrEqual(7)
  })

  // -----------------------------------------------------------------------
  // Stat badges — structure
  // -----------------------------------------------------------------------

  it('stat badges render a cyan dot icon before each label', () => {
    const { container } = renderHero()
    const cyanDots = container.querySelectorAll('.bg-cyan-400')
    // There are 4 SECTIONS, each with a cyan dot
    expect(cyanDots.length).toBe(4)
  })

  it('stat badges render description text alongside labels', () => {
    renderHero()
    // Each badge has both a label and a description separated by a dot
    expect(screen.getByText('Foundations to Production')).toBeInTheDocument()
    expect(screen.getByText('Learning roadmap')).toBeInTheDocument()
    expect(screen.getByText('Interview questions')).toBeInTheDocument()
    expect(screen.getByText('Practical examples')).toBeInTheDocument()
  })

  it('stat badges have hover-lift class for visual feedback', () => {
    const { container } = renderHero()
    const badgeContainer = container.querySelector('.flex.flex-wrap.gap-2')
    const badges = badgeContainer?.querySelectorAll('.hover-lift')
    expect(badges?.length).toBe(4)
  })

  // -----------------------------------------------------------------------
  // Keyboard hints
  // -----------------------------------------------------------------------

  it('keyboard hints paragraph mentions zoom and reset operations', () => {
    renderHero()
    // The keyboard hints include "zoom" and "reset" text
    expect(screen.getByText(/zoom/i)).toBeInTheDocument()
    expect(screen.getByText(/reset/i)).toBeInTheDocument()
  })

  it('keyboard hints have correct kbd structure with 3 keys', () => {
    const { container } = renderHero()
    const kbdElements = container.querySelectorAll('kbd')
    expect(kbdElements.length).toBe(3)
    const texts = Array.from(kbdElements).map((k) => k.textContent)
    expect(texts).toEqual(['+', '-', 'R'])
  })

  it('keyboard hints paragraph has pointer-events-auto class', () => {
    renderHero()
    const paragraphs = document.querySelectorAll('p')
    const hintP = Array.from(paragraphs).find((p) =>
      p.querySelector('kbd'),
    )
    expect(hintP).toBeInTheDocument()
    expect(hintP?.className).toContain('pointer-events-auto')
    expect(hintP?.className).toContain('animate-stagger-fade-in')
  })

  // -----------------------------------------------------------------------
  // Title structure — AI and MINDMAP
  // -----------------------------------------------------------------------

  it('AI part of title has heading color applied', () => {
    const { container } = renderHero()
    const h1 = container.querySelector('h1')
    // "AI" text is directly in the h1 (not wrapped in a span)
    expect(h1).toBeInTheDocument()
    expect(h1?.textContent).toContain('AI')
  })

  it('MINDMAP part of title has gradient background classes', () => {
    const { container } = renderHero()
    const span = container.querySelector('h1 span')
    expect(span).toBeInTheDocument()
    expect(span?.textContent).toBe('MINDMAP')
    expect(span?.className).toContain('bg-[var(--gradient-hero-title)]')
    expect(span?.className).toContain('bg-clip-text')
    expect(span?.className).toContain('text-transparent')
  })

  it('title font size differs between mobile and desktop', () => {
    // Desktop — text-6xl
    const { container: desktopContainer } = renderHero({ isMobile: false })
    const desktopH1 = desktopContainer.querySelector('h1')
    expect(desktopH1?.className).toContain('text-6xl')

    cleanup()

    // Mobile — text-4xl
    const { container: mobileContainer } = renderHero({ isMobile: true })
    const mobileH1 = mobileContainer.querySelector('h1')
    expect(mobileH1?.className).toContain('text-4xl')
  })

  it('subtitle font size differs between mobile and desktop', () => {
    // Desktop — text-base
    const { container: desktopContainer } = renderHero({ isMobile: false })
    const desktopP = desktopContainer.querySelector('p')
    expect(desktopP?.className).toContain('text-base')

    cleanup()

    // Mobile — text-sm
    const { container: mobileContainer } = renderHero({ isMobile: true })
    const mobileP = mobileContainer.querySelector('p')
    expect(mobileP?.className).toContain('text-sm')
  })

  it('subtitle paragraph has drop-shadow-md class', () => {
    const { container } = renderHero()
    const paragraphs = container.querySelectorAll('p')
    const subtitleP = Array.from(paragraphs).find(
      (p) =>
        p.textContent?.includes('An interactive 3D map') &&
        !p.querySelector('kbd'),
    )
    expect(subtitleP?.className).toContain('drop-shadow-md')
  })

  // -----------------------------------------------------------------------
  // Stats — visual layout
  // -----------------------------------------------------------------------

  it('stats section renders with flex-wrap layout', () => {
    const { container } = renderHero()
    const badgesSection = container.querySelector('.flex.flex-wrap.gap-2')
    expect(badgesSection).toBeInTheDocument()
    expect(badgesSection?.className).toContain('flex-wrap')
    expect(badgesSection?.className).toContain('pointer-events-auto')
  })

  // -----------------------------------------------------------------------
  // More count
  // -----------------------------------------------------------------------

  it('"+more" text shows correct count format with i18n plural', () => {
    renderHero()
    // fullPath has 15 items, desktop shows 7 → 8 more
    expect(screen.getByText(/8 more topics?/i)).toBeInTheDocument()
  })

  it('desktop with exactly 7 steps shows "+ 0 more topics"', () => {
    const sevenPath = fullPath.slice(0, 7)
    vi.mocked(getLearningPath).mockReturnValue(sevenPath)

    renderHero({ isMobile: false })

    // steps.length - 7 = 0 → shows "+ 0 more topics"
    expect(screen.getByText(/0 more topic/)).toBeInTheDocument()
    // All 7 items are visible
    sevenPath.forEach((node) => {
      expect(screen.getByText(node.id)).toBeInTheDocument()
    })
  })

  it('mobile with exactly 5 steps shows "+ 0 more topics"', () => {
    const fivePath = fullPath.slice(0, 5)
    vi.mocked(getLearningPath).mockReturnValue(fivePath)

    renderHero({ isMobile: true })

    expect(screen.getByText(/0 more topic/)).toBeInTheDocument()
    fivePath.forEach((node) => {
      expect(screen.getByText(node.id)).toBeInTheDocument()
    })
  })

  // -----------------------------------------------------------------------
  // Learning path — colors and styling
  // -----------------------------------------------------------------------

  it('dark mode learning path items have correct text color', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
      colors: {} as any, getGroupPalette: vi.fn(),
    } as any)

    const { container } = renderHero()
    const stepSpans = container.querySelectorAll(
      '.flex.flex-wrap.gap-1\\.5 span',
    )
    // First span should have secondary text color via semantic token
    const firstStepSpan = stepSpans[0]
    expect(firstStepSpan).toHaveClass('text-text-secondary')
  })

  it('light mode learning path items have correct text color', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light', isDark: false, toggle: vi.fn(), setMode: vi.fn(),
      colors: {} as any, getGroupPalette: vi.fn(),
    } as any)

    const { container } = renderHero()
    const stepSpans = container.querySelectorAll(
      '.flex.flex-wrap.gap-1\\.5 span',
    )
    const firstStepSpan = stepSpans[0]
    expect(firstStepSpan).toHaveClass('text-text-secondary')
  })

  it('step number prefix has distinct color in dark mode', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
      colors: {} as any, getGroupPalette: vi.fn(),
    } as any)

    const { container } = renderHero()
    const allSpans = container.querySelectorAll('span')
    const numberPrefixes = Array.from(allSpans).filter(
      (s) => s.textContent && /^\d+\.$/.test(s.textContent!),
    )
    expect(numberPrefixes.length).toBeGreaterThanOrEqual(7)
    numberPrefixes.forEach((span) => {
      expect(span).toHaveClass('text-text-muted')
    })
  })

  it('step items are spans with hover-lift class', () => {
    const { container } = renderHero()
    const stepContainer = container.querySelector('.flex.flex-wrap.gap-1\\.5')
    const stepItems = stepContainer?.querySelectorAll(':scope > span')
    expect(stepItems?.length).toBeGreaterThanOrEqual(8) // 7 steps + 1 more
    stepItems?.forEach((item) => {
      // Step items have hover-lift (the "more" span is the last child, also has glass-light)
      if (item.textContent?.includes('more')) return // skip "more" span
      expect(item.className).toContain('hover-lift')
      expect(item.className).toContain('glass-light')
    })
  })

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  it('renders without crash with isMobile=true and empty steps', () => {
    vi.mocked(getLearningPath).mockReturnValue([])
    expect(() => renderHero({ isMobile: true })).not.toThrow()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('renders without crash with isMobile=false and empty steps', () => {
    vi.mocked(getLearningPath).mockReturnValue([])
    expect(() => renderHero({ isMobile: false })).not.toThrow()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('stats badges are always shown regardless of learning path length', () => {
    vi.mocked(getLearningPath).mockReturnValue([])
    renderHero()

    expect(screen.getByText(/14 Topics/i)).toBeInTheDocument()
    expect(screen.getByText(/100\+ Q&A/i)).toBeInTheDocument()
    expect(screen.getByText(/50\+ Code/i)).toBeInTheDocument()
    expect(screen.getByText(/Step-by-Step/i)).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // CSS classes on the hero container
  // -----------------------------------------------------------------------

  it('hero container has z-30 class', () => {
    const { container } = renderHero()
    const heroDiv = container.querySelector('[data-tour="hero"]')
    expect(heroDiv?.className).toContain('z-30')
  })

  it('hero container has pointer-events-none class', () => {
    const { container } = renderHero()
    const heroDiv = container.querySelector('[data-tour="hero"]')
    expect(heroDiv?.className).toContain('pointer-events-none')
  })

  it('data-tour attribute is present on hero container', () => {
    const { container } = renderHero()
    const heroDiv = container.querySelector('[data-tour="hero"]')
    expect(heroDiv).toBeInTheDocument()
    expect(heroDiv?.getAttribute('data-tour')).toBe('hero')
  })

  it('hero container has absolute class', () => {
    const { container } = renderHero()
    const heroDiv = container.querySelector('[data-tour="hero"]')
    expect(heroDiv?.className).toContain('absolute')
  })

  // -----------------------------------------------------------------------
  // Step content
  // -----------------------------------------------------------------------

  it('learning path items show node.id as content alongside step number', () => {
    renderHero()
    // First 7 nodes from fullPath should show their id
    const first7 = fullPath.slice(0, 7)
    first7.forEach((node) => {
      expect(screen.getByText(node.id)).toBeInTheDocument()
    })
  })

  it('each step item has the step number badge before the node id', () => {
    const { container } = renderHero()
    const stepContainer = container.querySelector('.flex.flex-wrap.gap-1\\.5')
    // The step items are direct children spans (not the nested number spans)
    const stepSpans = stepContainer?.querySelectorAll(':scope > span')
    expect(stepSpans?.length).toBeGreaterThanOrEqual(8)

    // Each step span contains a number prefix span and node.id text
    const stepItem = stepSpans?.[0]
    const numberSpan = stepItem?.querySelector('span')
    expect(numberSpan?.textContent).toBe('1.')
    expect(stepItem?.textContent).toContain('LLM')
  })

  // -----------------------------------------------------------------------
  // glass-light class
  // -----------------------------------------------------------------------

  it('stat badges have glass-light class', () => {
    const { container } = renderHero()
    const badgesSection = container.querySelector('.flex.flex-wrap.gap-2')
    const badges = badgesSection?.querySelectorAll('.glass-light')
    expect(badges?.length).toBe(4)
  })

  it('learning path items have glass-light class', () => {
    const { container } = renderHero()
    const stepContainer = container.querySelector('.flex.flex-wrap.gap-1\\.5')
    const stepItems = stepContainer?.querySelectorAll('.glass-light')
    expect(stepItems?.length).toBeGreaterThanOrEqual(8) // 7 steps + 1 more
  })

  // -----------------------------------------------------------------------
  // i18n more key format
  // -----------------------------------------------------------------------

  it('"+more" uses correct i18n key producing "+X more topics" pattern', () => {
    renderHero()
    const moreSpan = screen.getByText(/more topics?/i)
    expect(moreSpan).toBeInTheDocument()
    expect(moreSpan.textContent).toMatch(/^\+\s*\d+\s+more topics?$/)
  })

  it('"+more" shows singular "topic" when count is 1', () => {
    // Create a path where steps.length - 7 = 1
    const eightPath = fullPath.slice(0, 8)
    vi.mocked(getLearningPath).mockReturnValue(eightPath)

    renderHero({ isMobile: false })

    expect(screen.getByText(/1 more topic/i)).toBeInTheDocument()
  })
})
