// 文字の種類
export type CharacterType = 'hiragana' | 'katakana' | 'kanji' | 'mixed'

// 用紙サイズ
export type PaperSize = 'A4' | 'B5'

// マス目サイズ
export type GridSize = 'small' | 'medium' | 'large'

// 練習シート設定
export interface PracticeSheetConfig {
  paperSize: PaperSize
  gridSize: GridSize
  repetitions: number
  showGuideLines: boolean
}

// 文字情報
export interface CharacterInfo {
  character: string
  type: CharacterType
  strokeOrder?: number[]
}

// 練習シートデータ
export interface PracticeSheetData {
  characters: CharacterInfo[]
  config: PracticeSheetConfig
  createdAt: Date
}