import { CharacterAnalyzer } from './CharacterAnalyzer'
import { ValidationResult, CharacterType } from '../types'

/**
 * 入力検証サービス
 * 文字数制限、不正文字の除外、リアルタイム入力検証を提供
 */
export class InputValidator {
  // 定数
  private static readonly MAX_CHARACTER_LIMIT = 500
  private static readonly MIN_CHARACTER_LIMIT = 1
  
  // 許可される文字の正規表現パターン
  private static readonly ALLOWED_PATTERNS = {
    hiragana: /[\u3040-\u309F]/,
    katakana: /[\u30A0-\u30FF]/,
    alphabet: /[A-Za-z]/,
    number: /[0-9０-９]/,
    punctuation: /[、。！？\s\n\r.,!?]/,
    kanji: /[\u4E00-\u9FAF]/
  }
  
  // 完全に許可される文字パターン（組み合わせ）
  private static readonly VALID_CHARACTER_PATTERN = new RegExp(
    `[${Object.values(InputValidator.ALLOWED_PATTERNS)
      .map(pattern => pattern.source.slice(1, -1))
      .join('')}]`,
    'g'
  )

  /**
   * 入力テキストの包括的な検証を実行
   */
  static validateInput(text: string): ValidationResult {
    const errors: string[] = []
    let isValid = true
    
    // 文字数チェック
    if (text.length === 0) {
      errors.push('文字を入力してください')
      isValid = false
    } else if (text.length > this.MAX_CHARACTER_LIMIT) {
      errors.push(`文字数が上限（${this.MAX_CHARACTER_LIMIT}文字）を超えています`)
      isValid = false
    }
    
    // 不正文字チェック
    const invalidChars = this.findInvalidCharacters(text)
    if (invalidChars.length > 0) {
      errors.push(`使用できない文字が含まれています: ${invalidChars.slice(0, 5).join(', ')}${invalidChars.length > 5 ? '...' : ''}`)
      isValid = false
    }
    
    // 文字種の判定
    const primaryType = this.determinePrimaryCharacterType(text)
    
    // 空白のみの入力チェック
    if (text.trim().length === 0 && text.length > 0) {
      errors.push('空白文字のみの入力はできません')
      isValid = false
    }
    
    return {
      isValid,
      errors,
      characterCount: text.length,
      primaryType
    }
  }

  /**
   * リアルタイム入力検証（入力中の文字をフィルタリング）
   */
  static filterInput(text: string): string {
    // 許可された文字のみを抽出
    const filteredText = text.match(this.VALID_CHARACTER_PATTERN)?.join('') || ''
    
    // 文字数制限を適用
    return filteredText.slice(0, this.MAX_CHARACTER_LIMIT)
  }

  /**
   * 不正な文字を検出
   */
  static findInvalidCharacters(text: string): string[] {
    const invalidChars: string[] = []
    const seenChars = new Set<string>()
    
    for (const char of text) {
      if (!this.isValidCharacter(char) && !seenChars.has(char)) {
        invalidChars.push(char)
        seenChars.add(char)
      }
    }
    
    return invalidChars
  }

  /**
   * 単一文字が有効かどうかをチェック
   */
  static isValidCharacter(char: string): boolean {
    return this.VALID_CHARACTER_PATTERN.test(char)
  }

  /**
   * 入力テキストの主要な文字種を判定
   */
  static determinePrimaryCharacterType(text: string): CharacterType {
    if (!text || text.trim().length === 0) {
      return 'mixed'
    }
    
    const charCounts = {
      hiragana: 0,
      katakana: 0,
      alphabet: 0,
      number: 0,
      kanji: 0,
      other: 0
    }
    
    // 各文字をカウント（空白・句読点は除外）
    for (const char of text) {
      if (/\s|[、。！？.,!?]/.test(char)) {
        continue // 空白と句読点はスキップ
      }
      
      const type = CharacterAnalyzer.detectType(char)
      if (type === 'hiragana') {
        charCounts.hiragana++
      } else if (type === 'katakana') {
        charCounts.katakana++
      } else if (type === 'alphabet') {
        charCounts.alphabet++
      } else if (type === 'number') {
        charCounts.number++
      } else if (this.ALLOWED_PATTERNS.kanji.test(char)) {
        charCounts.kanji++
      } else {
        charCounts.other++
      }
    }
    
    // 最も多い文字種を判定
    const totalChars = Object.values(charCounts).reduce((sum, count) => sum + count, 0)
    if (totalChars === 0) {
      return 'mixed'
    }
    
    const maxCount = Math.max(...Object.values(charCounts))
    const dominantTypes = Object.entries(charCounts)
      .filter(([_, count]) => count === maxCount)
      .map(([type, _]) => type)
    
    // 複数の文字種が同じ割合の場合は混在とする
    if (dominantTypes.length > 1 || maxCount / totalChars < 0.7) {
      return 'mixed'
    }
    
    const dominantType = dominantTypes[0]
    
    // 漢字は現在サポートしていないため、混在として扱う
    if (dominantType === 'kanji') {
      return 'mixed'
    }
    
    return dominantType as CharacterType
  }

  /**
   * 文字数制限をチェック
   */
  static isWithinCharacterLimit(text: string): boolean {
    return text.length >= this.MIN_CHARACTER_LIMIT && text.length <= this.MAX_CHARACTER_LIMIT
  }

  /**
   * 入力テキストが練習に適しているかをチェック
   */
  static isPracticeReady(text: string): boolean {
    const validation = this.validateInput(text)
    return validation.isValid && text.trim().length > 0
  }

  /**
   * 文字種別の統計情報を取得
   */
  static getCharacterStatistics(text: string): Record<CharacterType, number> {
    const stats: Record<CharacterType, number> = {
      hiragana: 0,
      katakana: 0,
      alphabet: 0,
      number: 0,
      symbol: 0,
      mixed: 0
    }
    
    for (const char of text) {
      if (/\s/.test(char)) continue // 空白はスキップ
      
      const type = CharacterAnalyzer.detectType(char)
      if (type in stats) {
        stats[type]++
      } else {
        stats.mixed++
      }
    }
    
    return stats
  }

  /**
   * 入力テキストをサニタイズ（安全な文字のみを残す）
   */
  static sanitizeInput(text: string): string {
    // XSS攻撃を防ぐため、HTMLタグを除去
    const withoutHtml = text.replace(/<[^>]*>/g, '')
    
    // 制御文字を除去（改行・タブは保持）
    const withoutControlChars = withoutHtml.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    
    // 許可された文字のみをフィルタリング
    return this.filterInput(withoutControlChars)
  }
}