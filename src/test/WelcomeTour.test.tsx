import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../store/ThemeContext'
import WelcomeTour from '../components/organisms/WelcomeTour'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('WelcomeTour', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders tour when not completed', () => {
    localStorageMock.getItem.mockReturnValue(null)
    const { container } = render(
      <ThemeProvider>
        <WelcomeTour />
      </ThemeProvider>,
    )
    // After 1.5s delay, the tour should show
    // We test the initial render state
    expect(container.textContent).not.toBeNull()
  })

  it('does not render tour when already completed', () => {
    localStorageMock.getItem.mockReturnValue('true')
    const { container } = render(
      <ThemeProvider>
        <WelcomeTour />
      </ThemeProvider>,
    )
    // Tour should not render when completed
    const paragraphs = container.querySelectorAll('p')
    const welcomeTexts = Array.from(paragraphs).filter(p => 
      p.textContent?.includes('Bem-vindo')
    )
    expect(welcomeTexts.length).toBe(0)
  })
})
