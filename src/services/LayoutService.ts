import { 
  LayoutConfig, 
  LayoutResult, 
  PageLayout, 
  LineLayout, 
  CharacterPosition,
  CharacterData,
  WritingDirection 
} from '../types'
import {
  calculateCharsPerLine,
  calculateLinesPerPage,
  calculateCharPosition,
  calculateRequiredPages,
  getLayoutSummary,
  calculateCharacterSize
} from '../utils/layoutUtils'
import { MARGINS, A4_DIMENSIONS } from '../constants/layout'

/**
 * レイアウトエンジン - 文字配置とページレイアウトを計算
 */
export class LayoutService {
  /**
   * 入力テキストをレイアウト設定に基づいて配置計算
   */
  static calculateLayout(
    characters: CharacterData[],
    config: LayoutConfig
  ): LayoutResult {
    const { direction, fontSize } = config
    
    // レイアウト基本情報を計算
    const charsPerLine = calculateCharsPerLine(fontSize, direction)
    const linesPerPage = calculateLinesPerPage(fontSize, direction)
    const totalPages = calculateRequiredPages(characters.length, fontSize, direction)
    
    // ページごとにレイアウトを生成
    const pages: PageLayout[] = []
    
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageLayout = this.calculatePageLayout(
        characters,
        pageIndex,
        charsPerLine,
        linesPerPage,
        fontSize,
        direction
      )
      pages.push(pageLayout)
    }
    
    return {
      pages,
      totalPages
    }
  }

  /**
   * 単一ページのレイアウトを計算
   */
  private static calculatePageLayout(
    characters: CharacterData[],
    pageIndex: number,
    charsPerLine: number,
    linesPerPage: number,
    fontSize: number,
    direction: WritingDirection
  ): PageLayout {
    const charsPerPage = charsPerLine * linesPerPage
    const startIndex = pageIndex * charsPerPage
    const endIndex = Math.min(startIndex + charsPerPage, characters.length)
    const pageCharacters = characters.slice(startIndex, endIndex)
    
    const lines: LineLayout[] = []
    
    // 行ごとに文字を配置
    for (let lineIndex = 0; lineIndex < linesPerPage; lineIndex++) {
      const lineStartIndex = lineIndex * charsPerLine
      const lineEndIndex = Math.min(lineStartIndex + charsPerLine, pageCharacters.length)
      
      if (lineStartIndex >= pageCharacters.length) {
        break // このページに配置する文字がもうない
      }
      
      const lineCharacters = pageCharacters.slice(lineStartIndex, lineEndIndex)
      const lineLayout = this.calculateLineLayout(
        lineCharacters,
        lineIndex,
        fontSize,
        direction
      )
      
      lines.push(lineLayout)
    }
    
    return { lines }
  }

  /**
   * 単一行のレイアウトを計算
   */
  private static calculateLineLayout(
    characters: CharacterData[],
    lineIndex: number,
    fontSize: number,
    direction: WritingDirection
  ): LineLayout {
    const characterPositions: CharacterPosition[] = []
    
    characters.forEach((charData, charIndex) => {
      const position = calculateCharPosition(lineIndex, charIndex, fontSize, direction)
      
      characterPositions.push({
        char: charData.char,
        x: position.x,
        y: position.y
      })
    })
    
    return {
      characters: characterPositions
    }
  }

  /**
   * レイアウト設定の妥当性をチェック
   */
  static validateLayoutConfig(config: LayoutConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // フォントサイズの妥当性チェック
    if (config.fontSize < 8 || config.fontSize > 72) {
      errors.push('フォントサイズは8pt〜72ptの範囲で指定してください')
    }
    
    // 書字方向の妥当性チェック
    if (!['horizontal', 'vertical'].includes(config.direction)) {
      errors.push('書字方向は horizontal または vertical を指定してください')
    }
    
    // 用紙サイズの妥当性チェック（現在はA4のみサポート）
    if (config.pageSize !== 'A4') {
      errors.push('現在はA4サイズのみサポートしています')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * レイアウト情報のプレビュー用サマリーを取得
   */
  static getLayoutPreview(
    textLength: number,
    config: LayoutConfig
  ): {
    charsPerLine: number
    linesPerPage: number
    charsPerPage: number
    totalPages: number
    layoutSummary: ReturnType<typeof getLayoutSummary>
  } {
    const { fontSize, direction } = config
    
    const layoutSummary = getLayoutSummary(fontSize, direction)
    const totalPages = calculateRequiredPages(textLength, fontSize, direction)
    
    return {
      charsPerLine: layoutSummary.charsPerLine,
      linesPerPage: layoutSummary.linesPerPage,
      charsPerPage: layoutSummary.charsPerPage,
      totalPages,
      layoutSummary
    }
  }

  /**
   * 文字列を CharacterData 配列に変換
   */
  static textToCharacterData(text: string): CharacterData[] {
    return Array.from(text).map(char => ({
      char,
      type: this.determineCharacterType(char)
    }))
  }

  /**
   * 単一文字の文字種を判定（簡易版）
   */
  private static determineCharacterType(char: string) {
    if (/[\u3040-\u309F]/.test(char)) return 'hiragana'
    if (/[\u30A0-\u30FF]/.test(char)) return 'katakana'
    if (/[A-Za-z]/.test(char)) return 'alphabet'
    if (/[0-9０-９]/.test(char)) return 'number'
    return 'symbol'
  }

  /**
   * レイアウト結果をデバッグ用文字列に変換
   */
  static layoutToDebugString(layout: LayoutResult): string {
    let result = `Total Pages: ${layout.totalPages}\n\n`
    
    layout.pages.forEach((page, pageIndex) => {
      result += `=== Page ${pageIndex + 1} ===\n`
      
      page.lines.forEach((line, lineIndex) => {
        result += `Line ${lineIndex + 1}: `
        line.characters.forEach(char => {
          result += `${char.char}(${char.x.toFixed(1)},${char.y.toFixed(1)}) `
        })
        result += '\n'
      })
      
      result += '\n'
    })
    
    return result
  }

  /**
   * 指定した座標が印刷可能領域内かどうかをチェック
   */
  static isWithinPrintableArea(x: number, y: number, fontSize: number): boolean {
    const charSize = calculateCharacterSize(fontSize)
    
    return (
      x >= MARGINS.LEFT &&
      y >= MARGINS.TOP &&
      x + charSize.width <= A4_DIMENSIONS.WIDTH - MARGINS.RIGHT &&
      y + charSize.height <= A4_DIMENSIONS.HEIGHT - MARGINS.BOTTOM
    )
  }
}