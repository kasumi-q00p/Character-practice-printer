import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { LayoutConfig, ValidationResult, AppError, ErrorType } from '../types'

// アプリケーション状態の型定義
export interface AppState {
  // 入力関連
  inputText: string
  layoutConfig: LayoutConfig
  validationResult: ValidationResult | null
  
  // UI状態
  isLoading: boolean
  error: AppError | null
  
  // 印刷関連
  isPrinting: boolean
  printProgress: number
  
  // 設定
  userPreferences: UserPreferences
}

export interface UserPreferences {
  defaultFontSize: number
  defaultDirection: 'horizontal' | 'vertical'
  defaultShowStrokeOrder: boolean
  autoSave: boolean
  theme: 'light' | 'dark'
}

// アクションの型定義
export type AppAction =
  | { type: 'SET_INPUT_TEXT'; payload: string }
  | { type: 'SET_LAYOUT_CONFIG'; payload: Partial<LayoutConfig> }
  | { type: 'SET_VALIDATION_RESULT'; payload: ValidationResult | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PRINTING'; payload: boolean }
  | { type: 'SET_PRINT_PROGRESS'; payload: number }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'RESET_STATE' }

// 初期状態
const initialState: AppState = {
  inputText: '',
  layoutConfig: {
    direction: 'horizontal',
    fontSize: 24,
    showStrokeOrder: false,
    pageSize: 'A4'
  },
  validationResult: null,
  isLoading: false,
  error: null,
  isPrinting: false,
  printProgress: 0,
  userPreferences: {
    defaultFontSize: 24,
    defaultDirection: 'horizontal',
    defaultShowStrokeOrder: false,
    autoSave: true,
    theme: 'light'
  }
}

// リデューサー
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUT_TEXT':
      return {
        ...state,
        inputText: action.payload,
        error: null // 入力変更時はエラーをクリア
      }
    
    case 'SET_LAYOUT_CONFIG':
      return {
        ...state,
        layoutConfig: {
          ...state.layoutConfig,
          ...action.payload
        }
      }
    
    case 'SET_VALIDATION_RESULT':
      return {
        ...state,
        validationResult: action.payload
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false // エラー時はローディングを停止
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    case 'SET_PRINTING':
      return {
        ...state,
        isPrinting: action.payload,
        printProgress: action.payload ? 0 : 100
      }
    
    case 'SET_PRINT_PROGRESS':
      return {
        ...state,
        printProgress: action.payload
      }
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      }
    
    case 'RESET_STATE':
      return {
        ...initialState,
        userPreferences: state.userPreferences // 設定は保持
      }
    
    default:
      return state
  }
}

// コンテキストの型定義
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  
  // ヘルパー関数
  setInputText: (text: string) => void
  updateLayoutConfig: (config: Partial<LayoutConfig>) => void
  setError: (error: AppError) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  setPrinting: (printing: boolean) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  resetApp: () => void
}

// コンテキストの作成
const AppContext = createContext<AppContextType | undefined>(undefined)

// プロバイダーコンポーネント
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  // ヘルパー関数
  const setInputText = (text: string) => {
    dispatch({ type: 'SET_INPUT_TEXT', payload: text })
  }
  
  const updateLayoutConfig = (config: Partial<LayoutConfig>) => {
    dispatch({ type: 'SET_LAYOUT_CONFIG', payload: config })
  }
  
  const setError = (error: AppError) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }
  
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }
  
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }
  
  const setPrinting = (printing: boolean) => {
    dispatch({ type: 'SET_PRINTING', payload: printing })
  }
  
  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences })
  }
  
  const resetApp = () => {
    dispatch({ type: 'RESET_STATE' })
  }
  
  const contextValue: AppContextType = {
    state,
    dispatch,
    setInputText,
    updateLayoutConfig,
    setError,
    clearError,
    setLoading,
    setPrinting,
    updatePreferences,
    resetApp
  }
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// カスタムフック
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// エラーヘルパー関数
export const createAppError = (
  type: ErrorType,
  message: string,
  details?: any
): AppError => ({
  type,
  message,
  details
})

// 設定の永続化ヘルパー
export const savePreferences = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem('character-practice-preferences', JSON.stringify(preferences))
  } catch (error) {
    console.warn('Failed to save preferences:', error)
  }
}

export const loadPreferences = (): Partial<UserPreferences> => {
  try {
    const saved = localStorage.getItem('character-practice-preferences')
    return saved ? JSON.parse(saved) : {}
  } catch (error) {
    console.warn('Failed to load preferences:', error)
    return {}
  }
}