// 文字の種類（CharacterAnalyzerと統合）
export type CharacterType = 'hiragana' | 'katakana' | 'alphabet' | 'number' | 'symbol' | 'mixed'

// 書字方向
export type WritingDirection = 'horizontal' | 'vertical'

// 用紙サイズ
export type PaperSize = 'A4'

// 文字データ
export interface CharacterData {
  char: string
  type: CharacterType
  strokeOrder?: StrokeInfo[]
}

// 書き順情報
export interface StrokeInfo {
  order: number
  path: string // SVG path for stroke
  position: { x: number; y: number } // 番号表示位置
}

// レイアウト設定
export interface LayoutConfig {
  direction: WritingDirection
  fontSize: number
  showStrokeOrder: boolean
  pageSize: PaperSize
}

// レイアウト結果
export interface LayoutResult {
  pages: PageLayout[]
  totalPages: number
}

// ページレイアウト
export interface PageLayout {
  lines: LineLayout[]
}

// 行レイアウト
export interface LineLayout {
  characters: CharacterPosition[]
}

// 文字位置
export interface CharacterPosition {
  char: string
  x: number
  y: number
}

// 寸法情報
export interface Dimensions {
  width: number
  height: number
}

// レイアウト定数
export interface LayoutConstants {
  A4_WIDTH: 210 // mm
  A4_HEIGHT: 297 // mm
  MARGIN_TOP: 20 // mm
  MARGIN_BOTTOM: 20 // mm
  MARGIN_LEFT: 15 // mm
  MARGIN_RIGHT: 15 // mm
  
  FONT_SIZES: number[] // [12, 16, 20, 24, 32, 48, 72]
  
  HORIZONTAL_LINE_HEIGHT_RATIO: 1.5
  VERTICAL_LINE_HEIGHT_RATIO: 1.2
  CHARACTER_SPACING_RATIO: 0.1
}

// 書き順データ構造
export interface StrokeOrderData {
  [character: string]: {
    strokes: StrokeInfo[]
    totalStrokes: number
  }
}

// エラータイプ
export enum ErrorType {
  INVALID_INPUT = 'INVALID_INPUT',
  FONT_LOAD_ERROR = 'FONT_LOAD_ERROR',
  LAYOUT_ERROR = 'LAYOUT_ERROR',
  PRINT_ERROR = 'PRINT_ERROR'
}

// アプリケーションエラー
export interface AppError {
  type: ErrorType
  message: string
  details?: any
}

// 入力検証結果
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  characterCount: number
  primaryType: CharacterType
}

// アプリケーション状態
export interface AppState {
  inputText: string
  writingDirection: WritingDirection
  characterType: CharacterType
  fontSize: number
  showStrokeOrder: boolean
}

// 旧インターフェース（後方互換性のため保持）
export type GridSize = 'small' | 'medium' | 'large'

export interface PracticeSheetConfig {
  paperSize: PaperSize
  gridSize: GridSize
  repetitions: number
  showGuideLines: boolean
}

export interface CharacterInfo {
  character: string
  type: CharacterType
  strokeOrder?: number[]
}

export interface PracticeSheetData {
  characters: CharacterInfo[]
  config: PracticeSheetConfig
  createdAt: Date
}