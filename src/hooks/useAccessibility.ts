import React, { useEffect, useCallback, useState } from 'react'

/**
 * アクセシビリティ機能を提供するカスタムフック
 */

export interface AccessibilityOptions {
  enableKeyboardNavigation?: boolean
  enableScreenReaderSupport?: boolean
  enableHighContrast?: boolean
  enableReducedMotion?: boolean
}

export interface AccessibilityState {
  isKeyboardUser: boolean
  isScreenReaderActive: boolean
  prefersHighContrast: boolean
  prefersReducedMotion: boolean
  fontSize: 'normal' | 'large' | 'extra-large'
}

export function useAccessibility(options: AccessibilityOptions = {}) {
  const {
    enableKeyboardNavigation = true,
    enableScreenReaderSupport = true,
    enableHighContrast = true,
    enableReducedMotion = true
  } = options

  const [state, setState] = useState<AccessibilityState>({
    isKeyboardUser: false,
    isScreenReaderActive: false,
    prefersHighContrast: false,
    prefersReducedMotion: false,
    fontSize: 'normal'
  })

  // キーボードユーザーの検出
  useEffect(() => {
    if (!enableKeyboardNavigation) return

    let isKeyboardUser = false

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isKeyboardUser = true
        setState(prev => ({ ...prev, isKeyboardUser: true }))
        document.body.classList.add('keyboard-user')
      }
    }

    const handleMouseDown = () => {
      if (isKeyboardUser) {
        isKeyboardUser = false
        setState(prev => ({ ...prev, isKeyboardUser: false }))
        document.body.classList.remove('keyboard-user')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [enableKeyboardNavigation])

  // スクリーンリーダーの検出
  useEffect(() => {
    if (!enableScreenReaderSupport) return

    // スクリーンリーダーの存在を検出（簡易版）
    const checkScreenReader = () => {
      const isScreenReader = 
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.speechSynthesis?.getVoices().length > 0

      setState(prev => ({ ...prev, isScreenReaderActive: isScreenReader }))
    }

    checkScreenReader()
    
    // 音声合成の変更を監視
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', checkScreenReader)
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', checkScreenReader)
      }
    }
  }, [enableScreenReaderSupport])

  // ユーザー設定の検出
  useEffect(() => {
    if (enableHighContrast) {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      setState(prev => ({ ...prev, prefersHighContrast: highContrastQuery.matches }))
      
      const handleHighContrastChange = (e: MediaQueryListEvent) => {
        setState(prev => ({ ...prev, prefersHighContrast: e.matches }))
      }
      
      highContrastQuery.addEventListener('change', handleHighContrastChange)
      return () => highContrastQuery.removeEventListener('change', handleHighContrastChange)
    }
  }, [enableHighContrast])

  useEffect(() => {
    if (enableReducedMotion) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setState(prev => ({ ...prev, prefersReducedMotion: reducedMotionQuery.matches }))
      
      const handleReducedMotionChange = (e: MediaQueryListEvent) => {
        setState(prev => ({ ...prev, prefersReducedMotion: e.matches }))
      }
      
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
      return () => reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    }
  }, [enableReducedMotion])

  // フォントサイズの管理
  const setFontSize = useCallback((size: AccessibilityState['fontSize']) => {
    setState(prev => ({ ...prev, fontSize: size }))
    
    const root = document.documentElement
    switch (size) {
      case 'large':
        root.style.fontSize = '18px'
        break
      case 'extra-large':
        root.style.fontSize = '20px'
        break
      default:
        root.style.fontSize = '16px'
    }
  }, [])

  // スクリーンリーダー用のアナウンス
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReaderSupport) return

    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message
    
    document.body.appendChild(announcer)
    
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }, [enableScreenReaderSupport])

  // フォーカス管理
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      // スクリーンリーダー用にフォーカス移動をアナウンス
      if (state.isScreenReaderActive) {
        const label = element.getAttribute('aria-label') || 
                     element.getAttribute('title') || 
                     element.textContent || 
                     'フォーカスが移動しました'
        announce(label)
      }
    }
  }, [state.isScreenReaderActive, announce])

  // キーボードナビゲーション用のヘルパー
  const handleKeyboardNavigation = useCallback((
    e: React.KeyboardEvent,
    handlers: Record<string, () => void>
  ) => {
    if (!enableKeyboardNavigation) return

    const handler = handlers[e.key]
    if (handler) {
      e.preventDefault()
      handler()
    }
  }, [enableKeyboardNavigation])

  return {
    state,
    setFontSize,
    announce,
    focusElement,
    handleKeyboardNavigation
  }
}

// スクリーンリーダー専用テキスト用のコンポーネント
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  React.createElement('span', { className: 'sr-only' }, children)
)

// フォーカス可能な要素を取得するヘルパー
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors))
}

// フォーカストラップ用のフック
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements(document.body)
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive])
}

// 色覚異常対応のヘルパー
export function getColorBlindFriendlyColors() {
  return {
    success: '#4CAF50',    // 緑（色覚異常でも識別可能）
    error: '#f44336',      // 赤
    warning: '#ff9800',    // オレンジ
    info: '#2196f3',       // 青
    neutral: '#666666'     // グレー
  }
}

// コントラスト比を計算するヘルパー
export function calculateContrastRatio(color1: string, color2: string): number {
  // 簡易的なコントラスト比計算（実際の実装では更に詳細な計算が必要）
  const getLuminance = (color: string) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    const [rs, gs, bs] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    )
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}