import { useState, useCallback, useMemo } from 'react'
import { InputValidator } from '../services/InputValidator'
import { ValidationResult, WritingDirection } from '../types'

/**
 * 入力検証とフォーム状態管理のカスタムフック
 */
export interface UseInputValidationReturn {
  // 状態
  inputText: string
  writingDirection: WritingDirection
  fontSize: number
  showStrokeOrder: boolean
  validationResult: ValidationResult
  
  // アクション
  setInputText: (text: string) => void
  setWritingDirection: (direction: WritingDirection) => void
  setFontSize: (size: number) => void
  setShowStrokeOrder: (show: boolean) => void
  
  // ヘルパー
  isValid: boolean
  isPracticeReady: boolean
  sanitizedText: string
}

export interface UseInputValidationOptions {
  initialText?: string
  initialDirection?: WritingDirection
  initialFontSize?: number
  initialShowStrokeOrder?: boolean
  enableRealTimeValidation?: boolean
  enableAutoSanitization?: boolean
}

export function useInputValidation(options: UseInputValidationOptions = {}): UseInputValidationReturn {
  const {
    initialText = '',
    initialDirection = 'horizontal',
    initialFontSize = 24,
    initialShowStrokeOrder = false,
    enableRealTimeValidation = true,
    enableAutoSanitization = true
  } = options

  // 状態管理
  const [inputText, setInputTextState] = useState(initialText)
  const [writingDirection, setWritingDirection] = useState<WritingDirection>(initialDirection)
  const [fontSize, setFontSize] = useState(initialFontSize)
  const [showStrokeOrder, setShowStrokeOrder] = useState(initialShowStrokeOrder)

  // 入力テキストの設定（検証・サニタイズ付き）
  const setInputText = useCallback((text: string) => {
    let processedText = text
    
    if (enableAutoSanitization) {
      processedText = InputValidator.sanitizeInput(text)
    }
    
    if (enableRealTimeValidation) {
      processedText = InputValidator.filterInput(processedText)
    }
    
    setInputTextState(processedText)
  }, [enableAutoSanitization, enableRealTimeValidation])

  // 検証結果の計算（メモ化）
  const validationResult = useMemo(() => {
    return InputValidator.validateInput(inputText)
  }, [inputText])

  // サニタイズされたテキスト
  const sanitizedText = useMemo(() => {
    return InputValidator.sanitizeInput(inputText)
  }, [inputText])

  // ヘルパー値
  const isValid = validationResult.isValid
  const isPracticeReady = useMemo(() => {
    return InputValidator.isPracticeReady(inputText)
  }, [inputText])

  return {
    // 状態
    inputText,
    writingDirection,
    fontSize,
    showStrokeOrder,
    validationResult,
    
    // アクション
    setInputText,
    setWritingDirection,
    setFontSize,
    setShowStrokeOrder,
    
    // ヘルパー
    isValid,
    isPracticeReady,
    sanitizedText
  }
}