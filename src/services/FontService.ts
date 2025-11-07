import { CharacterType } from '../types'

/**
 * フォント管理サービス
 * Google Fonts の読み込みと文字種に応じたフォント選択を管理
 */
export class FontService {
  private static instance: FontService
  private loadedFonts: Set<string> = new Set()
  private fontLoadPromises: Map<string, Promise<void>> = new Map()

  // フォント設定
  private static readonly FONT_CONFIG = {
    // 日本語フォント（ひらがな、カタカナ、漢字）
    japanese: {
      primary: 'Noto Sans JP',
      fallbacks: ['Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;300;400;500;700&display=swap'
    },
    // 英数字フォント
    latin: {
      primary: 'Noto Sans',
      fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100;300;400;500;700&display=swap'
    },
    // 等幅フォント（数字用）
    monospace: {
      primary: 'Noto Sans Mono',
      fallbacks: ['Consolas', 'Monaco', 'monospace'],
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100;300;400;500;700&display=swap'
    }
  }

  private constructor() {
    this.preloadEssentialFonts()
  }

  static getInstance(): FontService {
    if (!FontService.instance) {
      FontService.instance = new FontService()
    }
    return FontService.instance
  }

  /**
   * 必須フォントの事前読み込み
   */
  private async preloadEssentialFonts(): Promise<void> {
    try {
      await Promise.all([
        this.loadGoogleFont('japanese'),
        this.loadGoogleFont('latin')
      ])
    } catch (error) {
      console.warn('Essential fonts preload failed:', error)
    }
  }

  /**
   * Google Fonts からフォントを読み込み
   */
  private async loadGoogleFont(fontType: keyof typeof FontService.FONT_CONFIG): Promise<void> {
    const config = FontService.FONT_CONFIG[fontType]
    const fontKey = `google-${fontType}`

    if (this.loadedFonts.has(fontKey)) {
      return Promise.resolve()
    }

    if (this.fontLoadPromises.has(fontKey)) {
      return this.fontLoadPromises.get(fontKey)!
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      // CSS link要素を作成
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = config.googleFontUrl
      link.crossOrigin = 'anonymous'

      link.onload = () => {
        this.loadedFonts.add(fontKey)
        this.fontLoadPromises.delete(fontKey)
        resolve()
      }

      link.onerror = () => {
        this.fontLoadPromises.delete(fontKey)
        reject(new Error(`Failed to load font: ${config.primary}`))
      }

      // タイムアウト設定（5秒）
      setTimeout(() => {
        if (!this.loadedFonts.has(fontKey)) {
          this.fontLoadPromises.delete(fontKey)
          reject(new Error(`Font load timeout: ${config.primary}`))
        }
      }, 5000)

      document.head.appendChild(link)
    })

    this.fontLoadPromises.set(fontKey, loadPromise)
    return loadPromise
  }

  /**
   * 文字種に応じた最適なフォントファミリーを取得
   */
  getFontFamily(characterType: CharacterType): string {
    switch (characterType) {
      case 'hiragana':
      case 'katakana':
        return this.buildFontFamily('japanese')
      
      case 'alphabet':
        return this.buildFontFamily('latin')
      
      case 'number':
        return this.buildFontFamily('monospace')
      
      case 'symbol':
        return this.buildFontFamily('latin')
      
      case 'mixed':
      default:
        // 混在の場合は日本語フォントを優先
        return this.buildFontFamily('japanese')
    }
  }

  /**
   * フォントファミリー文字列を構築
   */
  private buildFontFamily(fontType: keyof typeof FontService.FONT_CONFIG): string {
    const config = FontService.FONT_CONFIG[fontType]
    return [config.primary, ...config.fallbacks]
      .map(font => font.includes(' ') ? `"${font}"` : font)
      .join(', ')
  }

  /**
   * 文字種に応じたフォントを事前読み込み
   */
  async preloadFontForCharacterType(characterType: CharacterType): Promise<void> {
    try {
      switch (characterType) {
        case 'hiragana':
        case 'katakana':
        case 'mixed':
          await this.loadGoogleFont('japanese')
          break
        
        case 'alphabet':
        case 'symbol':
          await this.loadGoogleFont('latin')
          break
        
        case 'number':
          await this.loadGoogleFont('monospace')
          break
      }
    } catch (error) {
      console.warn(`Failed to preload font for ${characterType}:`, error)
    }
  }

  /**
   * 複数の文字種に対応するフォントを一括読み込み
   */
  async preloadFontsForCharacterTypes(characterTypes: CharacterType[]): Promise<void> {
    const uniqueTypes = [...new Set(characterTypes)]
    await Promise.all(
      uniqueTypes.map(type => this.preloadFontForCharacterType(type))
    )
  }

  /**
   * フォントが読み込み済みかチェック
   */
  isFontLoaded(characterType: CharacterType): boolean {
    switch (characterType) {
      case 'hiragana':
      case 'katakana':
      case 'mixed':
        return this.loadedFonts.has('google-japanese')
      
      case 'alphabet':
      case 'symbol':
        return this.loadedFonts.has('google-latin')
      
      case 'number':
        return this.loadedFonts.has('google-monospace')
      
      default:
        return false
    }
  }

  /**
   * すべての必須フォントが読み込み済みかチェック
   */
  areEssentialFontsLoaded(): boolean {
    return this.loadedFonts.has('google-japanese') && this.loadedFonts.has('google-latin')
  }

  /**
   * フォント読み込み状態をリセット（テスト用）
   */
  resetFontLoadState(): void {
    this.loadedFonts.clear()
    this.fontLoadPromises.clear()
  }

  /**
   * 文字に最適なフォントウェイトを取得
   */
  getOptimalFontWeight(_characterType: CharacterType, fontSize: number): number {
    // 小さいフォントサイズでは細いウェイト、大きいサイズでは標準ウェイト
    if (fontSize <= 16) {
      return 300 // Light
    } else if (fontSize <= 32) {
      return 400 // Regular
    } else {
      return 300 // 大きいサイズでも練習用なので細めに
    }
  }

  /**
   * CSS font-family プロパティ用の文字列を生成
   */
  generateCSSFontFamily(characterTypes: CharacterType[]): string {
    // 複数の文字種がある場合は、日本語フォントを優先
    if (characterTypes.length > 1 || characterTypes.includes('mixed')) {
      return this.getFontFamily('mixed')
    }
    
    return this.getFontFamily(characterTypes[0] || 'mixed')
  }

  /**
   * フォント読み込みエラーのハンドリング
   */
  handleFontLoadError(error: Error, characterType: CharacterType): void {
    console.error(`Font load error for ${characterType}:`, error)
    
    // フォールバック処理
    // エラーが発生した場合はシステムフォントを使用
    const fallbackFonts = this.getFallbackFonts(characterType)
    console.info(`Using fallback fonts for ${characterType}: ${fallbackFonts}`)
  }

  /**
   * フォールバックフォントを取得
   */
  private getFallbackFonts(characterType: CharacterType): string {
    switch (characterType) {
      case 'hiragana':
      case 'katakana':
      case 'mixed':
        return FontService.FONT_CONFIG.japanese.fallbacks.join(', ')
      
      case 'alphabet':
      case 'symbol':
        return FontService.FONT_CONFIG.latin.fallbacks.join(', ')
      
      case 'number':
        return FontService.FONT_CONFIG.monospace.fallbacks.join(', ')
      
      default:
        return 'sans-serif'
    }
  }

  /**
   * 印刷用のフォント設定を取得
   */
  getPrintFontSettings(characterType: CharacterType, fontSize: number) {
    return {
      fontFamily: this.getFontFamily(characterType),
      fontWeight: this.getOptimalFontWeight(characterType, fontSize),
      fontSize: `${fontSize}pt`,
      lineHeight: 1,
      letterSpacing: '0'
    }
  }
}