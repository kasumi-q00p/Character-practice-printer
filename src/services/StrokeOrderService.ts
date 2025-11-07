import { StrokeInfo, CharacterType, StrokeOrderData } from '../types'
import { CharacterAnalyzer } from './CharacterAnalyzer'

// 書き順データのインポート
import hiraganaData from '../data/strokeOrder/hiragana.json'
import katakanaData from '../data/strokeOrder/katakana.json'
import alphabetData from '../data/strokeOrder/alphabet.json'

/**
 * 書き順管理サービス
 * 文字の書き順データの読み込み、取得、位置計算を管理
 */
export class StrokeOrderService {
  private static instance: StrokeOrderService
  private strokeOrderData: Map<CharacterType, StrokeOrderData> = new Map()
  private loadedDataSets: Set<CharacterType> = new Set()

  private constructor() {
    this.initializeData()
  }

  static getInstance(): StrokeOrderService {
    if (!StrokeOrderService.instance) {
      StrokeOrderService.instance = new StrokeOrderService()
    }
    return StrokeOrderService.instance
  }

  /**
   * 書き順データの初期化
   */
  private initializeData(): void {
    try {
      // 各文字種のデータを読み込み
      this.strokeOrderData.set('hiragana', hiraganaData as StrokeOrderData)
      this.strokeOrderData.set('katakana', katakanaData as StrokeOrderData)
      this.strokeOrderData.set('alphabet', alphabetData as StrokeOrderData)
      
      this.loadedDataSets.add('hiragana')
      this.loadedDataSets.add('katakana')
      this.loadedDataSets.add('alphabet')
      
      console.log('Stroke order data initialized successfully')
    } catch (error) {
      console.error('Failed to initialize stroke order data:', error)
    }
  }

  /**
   * 指定した文字の書き順情報を取得
   */
  getStrokeOrder(character: string): StrokeInfo[] {
    const characterType = CharacterAnalyzer.detectType(character)
    const dataSet = this.strokeOrderData.get(characterType)
    
    if (!dataSet || !dataSet[character]) {
      return []
    }
    
    return dataSet[character].strokes
  }

  /**
   * 指定した文字の総画数を取得
   */
  getTotalStrokes(character: string): number {
    const characterType = CharacterAnalyzer.detectType(character)
    const dataSet = this.strokeOrderData.get(characterType)
    
    if (!dataSet || !dataSet[character]) {
      return 0
    }
    
    return dataSet[character].totalStrokes
  }

  /**
   * 文字に書き順データが存在するかチェック
   */
  hasStrokeOrder(character: string): boolean {
    const characterType = CharacterAnalyzer.detectType(character)
    const dataSet = this.strokeOrderData.get(characterType)
    
    return !!(dataSet && dataSet[character])
  }

  /**
   * 書き順番号の表示位置を計算
   */
  calculateStrokeNumberPositions(
    character: string,
    fontSize: number,
    baseX: number,
    baseY: number
  ): Array<{ order: number; x: number; y: number }> {
    const strokes = this.getStrokeOrder(character)
    
    if (strokes.length === 0) {
      return []
    }
    
    return strokes.map(stroke => {
      // フォントサイズに基づいて位置をスケーリング
      const scale = fontSize / 50 // 基準サイズを50ptとする
      
      return {
        order: stroke.order,
        x: baseX + (stroke.position.x * scale),
        y: baseY + (stroke.position.y * scale)
      }
    })
  }

  /**
   * 文字種別の書き順データが利用可能かチェック
   */
  isDataAvailable(characterType: CharacterType): boolean {
    return this.loadedDataSets.has(characterType)
  }

  /**
   * 複数文字の書き順情報を一括取得
   */
  getMultipleStrokeOrders(characters: string[]): Record<string, StrokeInfo[]> {
    const result: Record<string, StrokeInfo[]> = {}
    
    characters.forEach(char => {
      const strokes = this.getStrokeOrder(char)
      if (strokes.length > 0) {
        result[char] = strokes
      }
    })
    
    return result
  }

  /**
   * 文字列内の書き順対応文字数を取得
   */
  getStrokeOrderCoverage(text: string): {
    total: number
    covered: number
    coverage: number
  } {
    const characters = Array.from(text).filter(char => !char.match(/\s/))
    const covered = characters.filter(char => this.hasStrokeOrder(char))
    
    return {
      total: characters.length,
      covered: covered.length,
      coverage: characters.length > 0 ? covered.length / characters.length : 0
    }
  }

  /**
   * 書き順番号のスタイル設定を取得
   */
  getStrokeNumberStyle(fontSize: number): {
    fontSize: number
    width: number
    height: number
    borderRadius: string
  } {
    const numberSize = Math.max(fontSize * 0.25, 8)
    const containerSize = Math.max(fontSize * 0.3, 12)
    
    return {
      fontSize: numberSize,
      width: containerSize,
      height: containerSize,
      borderRadius: '50%'
    }
  }

  /**
   * 書き順アニメーション用のデータを生成
   */
  generateAnimationData(character: string, duration: number = 2000): Array<{
    order: number
    delay: number
    duration: number
    path: string
  }> {
    const strokes = this.getStrokeOrder(character)
    
    if (strokes.length === 0) {
      return []
    }
    
    const strokeDuration = duration / strokes.length
    
    return strokes.map((stroke, index) => ({
      order: stroke.order,
      delay: index * strokeDuration,
      duration: strokeDuration,
      path: stroke.path
    }))
  }

  /**
   * 書き順データの統計情報を取得
   */
  getStatistics(): {
    hiragana: { total: number; available: number }
    katakana: { total: number; available: number }
    alphabet: { total: number; available: number }
  } {
    const hiraganaData = this.strokeOrderData.get('hiragana') || {}
    const katakanaData = this.strokeOrderData.get('katakana') || {}
    const alphabetData = this.strokeOrderData.get('alphabet') || {}
    
    return {
      hiragana: {
        total: 46, // ひらがな基本文字数
        available: Object.keys(hiraganaData).length
      },
      katakana: {
        total: 46, // カタカナ基本文字数
        available: Object.keys(katakanaData).length
      },
      alphabet: {
        total: 62, // A-Z, a-z, 0-9
        available: Object.keys(alphabetData).length
      }
    }
  }

  /**
   * 書き順データをエクスポート（デバッグ用）
   */
  exportStrokeOrderData(characterType: CharacterType): StrokeOrderData | null {
    return this.strokeOrderData.get(characterType) || null
  }

  /**
   * カスタム書き順データを追加
   */
  addCustomStrokeOrder(character: string, strokeData: {
    totalStrokes: number
    strokes: StrokeInfo[]
  }): void {
    const characterType = CharacterAnalyzer.detectType(character)
    let dataSet = this.strokeOrderData.get(characterType)
    
    if (!dataSet) {
      dataSet = {}
      this.strokeOrderData.set(characterType, dataSet)
    }
    
    dataSet[character] = strokeData
  }

  /**
   * 書き順データをリセット（テスト用）
   */
  resetData(): void {
    this.strokeOrderData.clear()
    this.loadedDataSets.clear()
    this.initializeData()
  }

  /**
   * 文字の複雑度を計算（画数ベース）
   */
  getCharacterComplexity(character: string): 'simple' | 'medium' | 'complex' {
    const totalStrokes = this.getTotalStrokes(character)
    
    if (totalStrokes === 0) return 'simple'
    if (totalStrokes <= 3) return 'simple'
    if (totalStrokes <= 6) return 'medium'
    return 'complex'
  }

  /**
   * 練習推奨順序を取得
   */
  getPracticeOrder(characters: string[]): string[] {
    return characters
      .filter(char => this.hasStrokeOrder(char))
      .sort((a, b) => {
        const strokesA = this.getTotalStrokes(a)
        const strokesB = this.getTotalStrokes(b)
        return strokesA - strokesB
      })
  }
}