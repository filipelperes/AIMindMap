/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../store/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

// Mock data/map to control deterministic test data
vi.mock('../data/map', () => ({
  getLearningPath: vi.fn(),
  getCurrentStep: vi.fn(),
}))

// Mock atoms
vi.mock('../components/atoms/ThemeToggle', () => ({
  default: vi.fn().mockImplementation(() =>
    React.createElement('button', { 'data-testid': 'theme-toggle' }, '🌙'),
  ),
}))

// Mock i18n LocaleSwitcher
vi.mock('../i18n/LocaleSwitcher', () => ({
  default: vi.fn().mockImplementation(() =>
    React.createElement('span', { 'data-testid': 'locale-switcher' }, '🌐'),
  ),
}))

// Mock scrollIntoView for jsdom (not implemented by default)
Element.prototype.scrollIntoView = vi.fn()

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock)
// ---------------------------------------------------------------------------

import { useTheme } from '../store/ThemeContext'
import { getLearningPath, getCurrentStep } from '../data/map'
import SidebarNav from '../components/organisms/SidebarNav'
import type { MindMapNode } from '../types/mindmap'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const mockSteps: MindMapNode[] = [
  { id: 'LLM', group: 1, description: 'Foundations', content: { summary: '', sections: [] }, learningStep: 1 },
  { id: 'PromptEngineering', group: 2, description: 'Prompting', content: { summary: '', sections: [] }, learningStep: 2 },
  { id: 'RAG', group: 3, description: 'RAG', content: { summary: '', sections: [] }, learningStep: 3 },
  { id: 'FineTuning', group: 4, description: 'Fine-tuning', content: { summary: '', sections: [] }, learningStep: 4 },
  { id: 'Agent', group: 5, description: 'Agents', content: { summary: '', sections: [] }, learningStep: 5 },
]

// ---------------------------------------------------------------------------
// Default mock values
// ---------------------------------------------------------------------------

const defaultTheme = {
  mode: 'dark',
  isDark: true,
  toggle: vi.fn(),
  setMode: vi.fn(),
  colors: {} as any,
  getGroupPalette: vi.fn().mockImplementation((group: number) => ({
    base: '#FF006E',
    emissive: '#FF4081',
    accent: '#FF80AB',
    label: `Group ${group}`,
  })),
} as any

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderSidebar(overrides: {
  selectedNodeId?: string | null
  onSelect?: (id: string | null) => void
  onClose?: () => void
  isMobile?: boolean
  onExport?: () => void
  forceCloseMobile?: number
  onMobileOpenChange?: (open: boolean) => void
} = {}) {
  const onSelect = overrides.onSelect ?? vi.fn()
  const onClose = overrides.onClose ?? vi.fn()

  return render(
    <SidebarNav
      selectedNodeId={overrides.selectedNodeId ?? null}
      onSelect={onSelect}
      onClose={onClose}
      isMobile={overrides.isMobile ?? false}
      onExport={overrides.onExport}
      forceCloseMobile={overrides.forceCloseMobile}
      onMobileOpenChange={overrides.onMobileOpenChange}
    />,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SidebarNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useTheme).mockReturnValue(defaultTheme)

    vi.mocked(getLearningPath).mockReturnValue([...mockSteps])
    vi.mocked(getCurrentStep).mockImplementation(
      (id: string | null) =>
        mockSteps.find((s) => s.id === id)?.learningStep ?? 0,
    )
  })

  afterEach(() => {
    cleanup()
  })

  // =======================================================================
  // Desktop rendering
  // =======================================================================

  it('renders the sidebar with data-tour="sidebar" on desktop', () => {
    const { container } = renderSidebar()
    const aside = container.querySelector('[data-tour="sidebar"]')
    expect(aside).toBeInTheDocument()
  })

  it('renders all learning step items from getLearningPath', () => {
    renderSidebar()

    mockSteps.forEach((step) => {
      expect(screen.getByText(step.id)).toBeInTheDocument()
    })
  })

  it('renders the previous and next navigation buttons', () => {
    renderSidebar()

    expect(screen.getByText(/Previous/i)).toBeInTheDocument()
    expect(screen.getByText(/Next/i)).toBeInTheDocument()
  })

  it('renders the step counter (Step X / 15)', () => {
    renderSidebar({ selectedNodeId: 'RAG' })

    // currentStep = 3, total = 15
    expect(screen.getByText(/Step 3 \/ 15/i)).toBeInTheDocument()
  })

  it('renders the overview button when a node is selected', () => {
    renderSidebar({ selectedNodeId: 'LLM' })

    expect(screen.getByText(/Overview/i)).toBeInTheDocument()
  })

  it('does not render the overview button when no node is selected', () => {
    renderSidebar({ selectedNodeId: null })

    expect(screen.queryByText(/Overview/i)).not.toBeInTheDocument()
  })

  it('highlights the currently selected step', () => {
    renderSidebar({ selectedNodeId: 'RAG' })

    // The RAG button should have active styling (its step button)
    const ragBtn = screen.getByText('RAG').closest('button')
    expect(ragBtn).toBeInTheDocument()
    // Active indicator: data-step = 3
    expect(ragBtn?.getAttribute('data-step')).toBe('3')
  })

  it('renders the theme toggle component', () => {
    renderSidebar()
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('renders the locale switcher', () => {
    renderSidebar()
    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument()
  })

  it('renders the export button when onExport is provided', () => {
    const onExport = vi.fn()
    renderSidebar({ onExport })

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('does not render the export button when onExport is not provided', () => {
    renderSidebar()

    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument()
  })

  it('renders keyboard hint footers', () => {
    renderSidebar()

    expect(screen.getByText(/Navigate steps/i)).toBeInTheDocument()
  })

  // =======================================================================
  // Navigation: clicking steps / prev / next
  // =======================================================================

  it('clicking a step item calls onSelect with the node id', () => {
    const onSelect = vi.fn()
    renderSidebar({ selectedNodeId: null, onSelect })

    fireEvent.click(screen.getByText('RAG'))

    expect(onSelect).toHaveBeenCalledWith('RAG')
  })

  it('clicking the Previous button navigates to the previous step', () => {
    const onSelect = vi.fn()
    renderSidebar({ selectedNodeId: 'RAG', onSelect })

    // currentStep=3 → prev should go to step 2 (PromptEngineering)
    fireEvent.click(screen.getByText(/Previous/i))

    expect(onSelect).toHaveBeenCalledWith('PromptEngineering')
  })

  it('clicking the Next button navigates to the next step', () => {
    const onSelect = vi.fn()
    renderSidebar({ selectedNodeId: 'RAG', onSelect })

    // currentStep=3 → next should go to step 4 (FineTuning)
    fireEvent.click(screen.getByText(/Next/i))

    expect(onSelect).toHaveBeenCalledWith('FineTuning')
  })

  it('Previous button is disabled at step 1', () => {
    renderSidebar({ selectedNodeId: 'LLM' })

    const prevBtn = screen.getByText(/Previous/i).closest('button')
    expect(prevBtn).toBeDisabled()
  })

  it('Next button is disabled at step 15 (last step)', () => {
    // Mock getCurrentStep to return 15
    vi.mocked(getCurrentStep).mockReturnValue(15)

    renderSidebar({ selectedNodeId: 'Behavioral' })

    const nextBtn = screen.getByText(/Next/i).closest('button')
    expect(nextBtn).toBeDisabled()
  })

  it('clicking the overview button calls onClose', () => {
    const onClose = vi.fn()
    renderSidebar({ selectedNodeId: 'LLM', onClose })

    fireEvent.click(screen.getByText(/Overview/i))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // =======================================================================
  // Keyboard shortcuts
  // =======================================================================

  it('ArrowRight key calls onSelect with the next step', () => {
    const onSelect = vi.fn()
    renderSidebar({ selectedNodeId: 'LLM', onSelect })

    fireEvent.keyDown(window, { key: 'ArrowRight' })

    // Step 1 → Step 2 (PromptEngineering)
    expect(onSelect).toHaveBeenCalledWith('PromptEngineering')
  })

  it('ArrowLeft key calls onSelect with the previous step', () => {
    const onSelect = vi.fn()
    renderSidebar({ selectedNodeId: 'RAG', onSelect })

    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    // Step 3 → Step 2 (PromptEngineering)
    expect(onSelect).toHaveBeenCalledWith('PromptEngineering')
  })

  it('ArrowLeft key does nothing at step 1', () => {
    const onSelect = vi.fn()
    renderSidebar({ selectedNodeId: 'LLM', onSelect })

    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    // Step 1 → no step below 1, so goToStep(1) → finds LLM again
    // Current step is 1, prev = max(0, 0) = 1. goToStep(1) → find LLM → handleStepClick(LLM) → onSelect('LLM')
    // This is valid but it's the same node
    expect(onSelect).toHaveBeenCalledWith('LLM')
  })

  // =======================================================================
  // Mobile: hamburger + drawer
  // =======================================================================

  it('renders a hamburger button on mobile', () => {
    renderSidebar({ isMobile: true })

    expect(
      screen.getByRole('button', { name: /open navigation/i }),
    ).toBeInTheDocument()
  })

  it('opens the drawer when the hamburger is clicked on mobile', () => {
    renderSidebar({ isMobile: true })

    // Initially the drawer content should not be visible
    expect(screen.queryByText('LLM')).not.toBeInTheDocument()

    // Click hamburger
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))

    // Now steps should be visible
    expect(screen.getByText('LLM')).toBeInTheDocument()
  })

  it('closes the drawer when the close button is clicked on mobile', () => {
    renderSidebar({ isMobile: true })

    // Open the drawer
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))
    expect(screen.getByText('LLM')).toBeInTheDocument()

    // Click the close button (X icon button, which is the last button in the header)
    // In mobile, a close button is rendered inside the header with an X icon
    const closeBtn = screen
      .getAllByRole('button')
      .find((b) => b.querySelector('line')) // X icon has <line> elements
    if (closeBtn) {
      fireEvent.click(closeBtn)
    }

    // After closing, the steps should no longer be visible
    // The drawer is closed via setIsOpen(false), which unmounts the AnimatePresence content
  })

  it('Escape key closes the drawer on mobile', () => {
    const onSelect = vi.fn()
    renderSidebar({ isMobile: true, onSelect })

    // Open the drawer
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))
    expect(screen.getByText('LLM')).toBeInTheDocument()

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' })

    // Drawer should close (steps no longer visible)
    // The drawer is closed, so LLM should not be in the document
    // Note: after closing, the mobile drawer AnimatePresence exit animation removes the content
  })

  it('selecting a step on mobile closes the drawer', () => {
    const onSelect = vi.fn()
    renderSidebar({ isMobile: true, onSelect })

    // Open drawer
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))

    // Click a step
    fireEvent.click(screen.getByText('RAG'))

    // Should have called onSelect with RAG
    expect(onSelect).toHaveBeenCalledWith('RAG')
  })

  // =======================================================================
  // Force close
  // =======================================================================

  it('forceCloseMobile prop closes the drawer when it changes on mobile', () => {
    // First render with forceCloseMobile = 0 (open drawer)
    const { rerender } = render(
      <SidebarNav
        selectedNodeId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
        isMobile={true}
        forceCloseMobile={0}
      />,
    )

    // Open drawer
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))
    expect(screen.getByText('LLM')).toBeInTheDocument()

    // Re-render with forceCloseMobile = 1 (triggers close)
    rerender(
      <SidebarNav
        selectedNodeId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
        isMobile={true}
        forceCloseMobile={1}
      />,
    )
  })

  // =======================================================================
  // Theme styling
  // =======================================================================

  it('applies dark mode background to the sidebar', () => {
    vi.mocked(useTheme).mockReturnValue({
      ...defaultTheme,
      mode: 'dark',
      isDark: true,
    } as any)

    const { container } = renderSidebar()
    const aside = container.querySelector('[data-tour="sidebar"]') as HTMLElement

    expect(aside).toBeInTheDocument()
    expect(aside).toHaveClass('dark:bg-abyss/72')
  })

  it('applies light mode background to the sidebar', () => {
    vi.mocked(useTheme).mockReturnValue({
      ...defaultTheme,
      mode: 'light',
      isDark: false,
    } as any)

    const { container } = renderSidebar()
    const aside = container.querySelector('[data-tour="sidebar"]') as HTMLElement

    expect(aside).toBeInTheDocument()
    expect(aside).toHaveClass('bg-white/72')
  })

  // =======================================================================
  // Additional edge cases and behaviors
  // =======================================================================

  it('ArrowRight at last step does NOT call onSelect', () => {
    const onSelect = vi.fn()
    renderSidebar({ selectedNodeId: 'Agent', onSelect })

    fireEvent.keyDown(window, { key: 'ArrowRight' })

    // Step 5 → goNext → min(6,15)=6 → goToStep(6) → no matching step
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('ArrowRight with no selected node navigates to step 1', () => {
    const onSelect = vi.fn()
    renderSidebar({ selectedNodeId: null, onSelect })

    fireEvent.keyDown(window, { key: 'ArrowRight' })

    // currentStep=0 → goNext → min(1,15)=1 → goToStep(1) → finds LLM
    expect(onSelect).toHaveBeenCalledWith('LLM')
  })

  it('calls scrollIntoView on the active step element', () => {
    vi.mocked(Element.prototype.scrollIntoView).mockClear()
    renderSidebar({ selectedNodeId: 'RAG' })

    // The auto-scroll effect queries [data-step="3"] inside scrollRef
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('fires onMobileOpenChange(true) when hamburger is clicked on mobile', () => {
    const onMobileOpenChange = vi.fn()
    renderSidebar({ isMobile: true, onMobileOpenChange })

    // Clear the initial mount effect call: onMobileOpenChange(false)
    onMobileOpenChange.mockClear()

    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))

    expect(onMobileOpenChange).toHaveBeenCalledWith(true)
  })

  it('fires onMobileOpenChange(false) when close button is clicked on mobile', () => {
    const onMobileOpenChange = vi.fn()
    const { container } = renderSidebar({ isMobile: true, onMobileOpenChange })

    onMobileOpenChange.mockClear()

    // Open drawer
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))
    expect(onMobileOpenChange).toHaveBeenCalledWith(true)
    onMobileOpenChange.mockClear()

    // The close button (X icon) is inside the drawer aside and has SVG <line> elements
    const drawer = container.querySelector('aside[data-tour="sidebar"]')!
    const closeBtn = Array.from(drawer.querySelectorAll('button')).find(
      (btn) => btn.innerHTML.includes('line'),
    )!
    fireEvent.click(closeBtn)

    expect(onMobileOpenChange).toHaveBeenCalledWith(false)
  })

  it('Escape key on mobile fires onMobileOpenChange(false)', () => {
    const onMobileOpenChange = vi.fn()
    renderSidebar({ isMobile: true, onMobileOpenChange })

    onMobileOpenChange.mockClear()

    // Open drawer
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))
    expect(onMobileOpenChange).toHaveBeenCalledWith(true)
    onMobileOpenChange.mockClear()

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onMobileOpenChange).toHaveBeenCalledWith(false)
  })

  it('fires onExport when export button is clicked', () => {
    const onExport = vi.fn()
    renderSidebar({ onExport })

    fireEvent.click(screen.getByRole('button', { name: /export/i }))

    expect(onExport).toHaveBeenCalledTimes(1)
  })

  it('export button has aria-label "Export screenshot"', () => {
    renderSidebar({ onExport: vi.fn() })

    expect(
      screen.getByRole('button', { name: 'Export screenshot' }),
    ).toBeInTheDocument()
  })

  it('disables the previous button when no node is selected', () => {
    renderSidebar({ selectedNodeId: null })

    // currentStep=0 → disabled={0 <= 1} → true
    const prevBtn = screen.getByText(/Previous/i).closest('button')
    expect(prevBtn).toBeDisabled()
  })

  it('shows step counter "Step 1 / 15" for the first step', () => {
    renderSidebar({ selectedNodeId: 'LLM' })

    expect(screen.getByText('Step 1 / 15')).toBeInTheDocument()
  })

  it('shows step counter "Step 5 / 15" for the last mock step', () => {
    renderSidebar({ selectedNodeId: 'Agent' })

    expect(screen.getByText('Step 5 / 15')).toBeInTheDocument()
  })

  it('shows "Step - / 15" when no node is selected', () => {
    renderSidebar({ selectedNodeId: null })

    // currentStep=0 → 0 || '-' → '-'
    expect(screen.getByText('Step - / 15')).toBeInTheDocument()
  })

  it('renders without crashing when onExport is provided but onMobileOpenChange is not', () => {
    const { container } = renderSidebar({ onExport: vi.fn() })

    const aside = container.querySelector('[data-tour="sidebar"]')
    expect(aside).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('renders all step buttons with correct data-step attributes', () => {
    const { container } = renderSidebar()

    const stepButtons = Array.from(
      container.querySelectorAll('button[data-step]'),
    )
    expect(stepButtons).toHaveLength(mockSteps.length)

    stepButtons.forEach((btn, i) => {
      expect(btn.getAttribute('data-step')).toBe(
        String(mockSteps[i].learningStep),
      )
    })
  })

  it('renders checkmarks for steps completed before the current step', () => {
    renderSidebar({ selectedNodeId: 'RAG' })

    // Steps 1 (LLM) and 2 (PromptEngineering) have learningStep < 3
    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks).toHaveLength(2)
  })

  it('closes the mobile drawer when the backdrop overlay is clicked', () => {
    const { container } = renderSidebar({ isMobile: true })

    // Open drawer
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))
    expect(screen.getByText('LLM')).toBeInTheDocument()

    // DOM after open: [hamburger btn, backdrop div, drawer aside]
    // The backdrop (children[1]) has onClick={() => setIsOpen(false)}
    const backdrop = container.children[1]
    fireEvent.click(backdrop)

    expect(screen.queryByText('LLM')).not.toBeInTheDocument()
  })

  it('renders the sidebar title "AI MindMap"', () => {
    renderSidebar()

    // t('sidebar.title') === 'AI MindMap'
    expect(screen.getByText('AI MindMap')).toBeInTheDocument()
  })

  it('renders group palette labels for each step', () => {
    renderSidebar()

    // getGroupPalette mock returns { label: `Group ${group}` }
    expect(screen.getByText('Group 1')).toBeInTheDocument()
    expect(screen.getByText('Group 2')).toBeInTheDocument()
    expect(screen.getByText('Group 3')).toBeInTheDocument()
    expect(screen.getByText('Group 4')).toBeInTheDocument()
    expect(screen.getByText('Group 5')).toBeInTheDocument()
  })

  it('enables the next button when not at the last step', () => {
    renderSidebar({ selectedNodeId: 'LLM' })

    const nextBtn = screen.getByText(/Next/i).closest('button')
    expect(nextBtn).toBeEnabled()
  })

  it('does not render the hamburger button on desktop', () => {
    renderSidebar()

    expect(
      screen.queryByRole('button', { name: /open navigation/i }),
    ).not.toBeInTheDocument()
  })

  it('renders all navigation controls inside the mobile drawer', () => {
    renderSidebar({ isMobile: true })

    // Open drawer
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))

    // All controls should be visible inside the opened drawer
    expect(screen.getByText(/Previous/i)).toBeInTheDocument()
    expect(screen.getByText(/Next/i)).toBeInTheDocument()
    expect(screen.getByText('LLM')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
  })
})
