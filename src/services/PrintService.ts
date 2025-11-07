import { LayoutConfig, LayoutResult, PageLayout } from '../types'
import { LayoutService } from './LayoutService'
import { FontService } from './FontService'

/**
 * 印刷管理サービス
 * ブラウザ印刷ダイアログの呼び出し、印刷プレビュー、エラーハンドリングを管理
 */
export class PrintService {
  private static instance: PrintService
  private fontService: FontService
  private isPrintInProgress = false
  private printStyleElement: HTMLStyleElement | null = null

  private constructor() {
    this.fontService = FontService.getInstance()
  }

  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService()
    }
    return PrintService.instance
  }

  /**
   * 印刷を実行
   */
  async print(
    inputText: string,
    layoutConfig: LayoutConfig,
    options: PrintOptions = {}
  ): Promise<PrintResult> {
    if (this.isPrintInProgress) {
      return {
        success: false,
        error: '印刷処理が既に実行中です'
      }
    }

    this.isPrintInProgress = true

    try {
      // 入力検証
      const validationResult = this.validatePrintInput(inputText, layoutConfig)
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        }
      }

      // フォントの事前読み込み
      await this.preloadRequiredFonts(inputText)

      // レイアウト計算
      const characters = LayoutService.textToCharacterData(inputText)
      const layoutResult = LayoutService.calculateLayout(characters, layoutConfig)

      // 印刷用スタイルを適用
      this.applyPrintStyles(layoutConfig, options)

      // 印刷用コンテンツを生成
      const printContent = this.generatePrintContent(layoutResult, layoutConfig, options)

      // 印刷実行
      const printResult = await this.executePrint(printContent, options)

      return printResult

    } catch (error) {
      console.error('Print execution failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '印刷処理中にエラーが発生しました'
      }
    } finally {
      this.isPrintInProgress = false
      this.cleanupPrintStyles()
    }
  }

  /**
   * 印刷プレビューを表示
   */
  async showPrintPreview(
    inputText: string,
    layoutConfig: LayoutConfig,
    options: PrintOptions = {}
  ): Promise<void> {
    try {
      // フォントの事前読み込み
      await this.preloadRequiredFonts(inputText)

      // レイアウト計算
      const characters = LayoutService.textToCharacterData(inputText)
      const layoutResult = LayoutService.calculateLayout(characters, layoutConfig)

      // 印刷用スタイルを適用
      this.applyPrintStyles(layoutConfig, options)

      // 印刷用コンテンツを生成
      const printContent = this.generatePrintContent(layoutResult, layoutConfig, options)

      // 新しいウィンドウで印刷プレビューを表示
      const previewWindow = window.open('', '_blank', 'width=800,height=600')
      if (previewWindow) {
        previewWindow.document.write(printContent)
        previewWindow.document.close()
      }

    } catch (error) {
      console.error('Print preview failed:', error)
      throw new Error('印刷プレビューの生成に失敗しました')
    }
  }

  /**
   * 印刷入力の検証
   */
  private validatePrintInput(inputText: string, layoutConfig: LayoutConfig): {
    isValid: boolean
    error?: string
  } {
    if (!inputText.trim()) {
      return { isValid: false, error: '印刷する文字が入力されていません' }
    }

    if (inputText.length > 1000) {
      return { isValid: false, error: '文字数が多すぎます（1000文字以内）' }
    }

    const layoutValidation = LayoutService.validateLayoutConfig(layoutConfig)
    if (!layoutValidation.isValid) {
      return { isValid: false, error: layoutValidation.errors.join(', ') }
    }

    return { isValid: true }
  }

  /**
   * 必要なフォントを事前読み込み
   */
  private async preloadRequiredFonts(inputText: string): Promise<void> {
    const characterTypes = new Set<string>()
    
    for (const char of inputText) {
      if (/[\u3040-\u309F]/.test(char)) characterTypes.add('hiragana')
      else if (/[\u30A0-\u30FF]/.test(char)) characterTypes.add('katakana')
      else if (/[A-Za-z]/.test(char)) characterTypes.add('alphabet')
      else if (/[0-9]/.test(char)) characterTypes.add('number')
    }

    const types = Array.from(characterTypes) as any[]
    await this.fontService.preloadFontsForCharacterTypes(types)
  }

  /**
   * 印刷用スタイルを適用
   */
  private applyPrintStyles(layoutConfig: LayoutConfig, options: PrintOptions): void {
    // 既存のスタイルを削除
    this.cleanupPrintStyles()

    // 新しいスタイル要素を作成
    this.printStyleElement = document.createElement('style')
    this.printStyleElement.id = 'print-service-styles'
    
    const styles = this.generatePrintCSS(layoutConfig, options)
    this.printStyleElement.textContent = styles
    
    document.head.appendChild(this.printStyleElement)
  }

  /**
   * 印刷用CSSを生成
   */
  private generatePrintCSS(layoutConfig: LayoutConfig, options: PrintOptions): string {
    const { fontSize, direction, showStrokeOrder } = layoutConfig
    const { grayscaleIntensity = 0.8, showGuideLines = true } = options

    return `
      @media print {
        @page {
          size: A4;
          margin: 20mm 15mm;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          font-size: ${fontSize}pt !important;
          writing-mode: ${direction === 'vertical' ? 'vertical-rl' : 'horizontal-tb'} !important;
        }
        
        .practice-character {
          color: rgba(200, 200, 200, ${grayscaleIntensity}) !important;
        }
        
        .stroke-order-number {
          display: ${showStrokeOrder ? 'flex' : 'none'} !important;
          color: #ff6b6b !important;
        }
        
        .guide-lines {
          opacity: ${showGuideLines ? '0.05' : '0'} !important;
        }
        
        .no-print {
          display: none !important;
        }
        
        .printable {
          display: block !important;
        }
      }
    `
  }

  /**
   * 印刷用HTMLコンテンツを生成
   */
  private generatePrintContent(
    layoutResult: LayoutResult,
    layoutConfig: LayoutConfig,
    options: PrintOptions
  ): string {
    const { title = '文字練習シート' } = options
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            ${this.generatePrintCSS(layoutConfig, options)}
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Noto Sans JP', sans-serif;
            }
            
            .page {
              width: 210mm;
              height: 297mm;
              page-break-after: always;
              position: relative;
            }
            
            .page:last-child {
              page-break-after: avoid;
            }
            
            .character {
              position: absolute;
              color: #ddd;
              font-weight: 100;
            }
          </style>
        </head>
        <body>
          ${this.generatePagesHTML(layoutResult, layoutConfig)}
        </body>
      </html>
    `
  }

  /**
   * ページHTMLを生成
   */
  private generatePagesHTML(layoutResult: LayoutResult, layoutConfig: LayoutConfig): string {
    return layoutResult.pages.map((page, pageIndex) => 
      this.generatePageHTML(page, layoutConfig, pageIndex)
    ).join('')
  }

  /**
   * 単一ページのHTMLを生成
   */
  private generatePageHTML(page: PageLayout, layoutConfig: LayoutConfig, _pageIndex: number): string {
    const charactersHTML = page.lines.flatMap(line => 
      line.characters.map(char => 
        `<div class="character" style="left: ${char.x}mm; top: ${char.y}mm; font-size: ${layoutConfig.fontSize}pt;">
          ${char.char}
        </div>`
      )
    ).join('')

    return `
      <div class="page">
        ${charactersHTML}
      </div>
    `
  }

  /**
   * 印刷を実行
   */
  private async executePrint(printContent: string, options: PrintOptions): Promise<PrintResult> {
    return new Promise((resolve) => {
      try {
        if (options.useNewWindow) {
          // 新しいウィンドウで印刷
          const printWindow = window.open('', '_blank')
          if (!printWindow) {
            resolve({
              success: false,
              error: 'ポップアップがブロックされました。ポップアップを許可してください。'
            })
            return
          }

          printWindow.document.write(printContent)
          printWindow.document.close()
          
          printWindow.onload = () => {
            printWindow.print()
            printWindow.close()
            resolve({ success: true })
          }
        } else {
          // 現在のウィンドウで印刷
          const originalContent = document.body.innerHTML
          document.body.innerHTML = printContent
          
          window.print()
          
          // 元のコンテンツを復元
          document.body.innerHTML = originalContent
          resolve({ success: true })
        }
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : '印刷処理でエラーが発生しました'
        })
      }
    })
  }

  /**
   * 印刷用スタイルをクリーンアップ
   */
  private cleanupPrintStyles(): void {
    if (this.printStyleElement) {
      this.printStyleElement.remove()
      this.printStyleElement = null
    }
  }

  /**
   * 印刷状態を取得
   */
  isPrinting(): boolean {
    return this.isPrintInProgress
  }

  /**
   * 印刷をキャンセル
   */
  cancelPrint(): void {
    this.isPrintInProgress = false
    this.cleanupPrintStyles()
  }
}

// 印刷オプションの型定義
export interface PrintOptions {
  title?: string
  grayscaleIntensity?: number
  showGuideLines?: boolean
  useNewWindow?: boolean
}

// 印刷結果の型定義
export interface PrintResult {
  success: boolean
  error?: string
}