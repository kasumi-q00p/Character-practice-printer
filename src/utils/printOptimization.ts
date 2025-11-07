import { LayoutConfig, PageLayout } from '../types'
import { A4_DIMENSIONS, MARGINS } from '../constants/layout'
import { ptToMm } from './layoutUtils'

/**
 * 印刷最適化ユーティリティ
 * 印刷時の余白調整、ページ分割最適化、印刷品質確保
 */

export interface PrintOptimizationOptions {
  // 余白調整
  adjustMargins?: boolean
  customMargins?: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  
  // ページ分割最適化
  optimizePageBreaks?: boolean
  avoidOrphanLines?: boolean
  
  // 印刷品質
  enhanceTextQuality?: boolean
  optimizeForPrinter?: 'inkjet' | 'laser' | 'auto'
  
  // 色調整
  grayscaleMode?: boolean
  contrastAdjustment?: number
}

/**
 * 印刷用の余白を最適化
 */
export function optimizeMargins(
  layoutConfig: LayoutConfig,
  options: PrintOptimizationOptions = {}
): { top: number; bottom: number; left: number; right: number } {
  const { adjustMargins = true, customMargins = {} } = options
  
  if (!adjustMargins) {
    return {
      top: customMargins.top || MARGINS.TOP,
      bottom: customMargins.bottom || MARGINS.BOTTOM,
      left: customMargins.left || MARGINS.LEFT,
      right: customMargins.right || MARGINS.RIGHT
    }
  }
  
  // フォントサイズに基づく動的余白調整
  const fontSize = layoutConfig.fontSize
  const baseMargin = Math.max(15, fontSize * 0.6) // 最小15mm
  
  // 書字方向による調整
  const directionMultiplier = layoutConfig.direction === 'vertical' ? 1.1 : 1.0
  
  return {
    top: customMargins.top || Math.round(baseMargin * directionMultiplier),
    bottom: customMargins.bottom || Math.round(baseMargin * directionMultiplier),
    left: customMargins.left || Math.round(baseMargin),
    right: customMargins.right || Math.round(baseMargin)
  }
}

/**
 * ページ分割を最適化
 */
export function optimizePageBreaks(
  pages: PageLayout[],
  layoutConfig: LayoutConfig,
  options: PrintOptimizationOptions = {}
): PageLayout[] {
  const { optimizePageBreaks = true, avoidOrphanLines = true } = options
  
  if (!optimizePageBreaks) {
    return pages
  }
  
  const optimizedPages: PageLayout[] = []
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    let optimizedPage = { ...page }
    
    // 孤立行の回避
    if (avoidOrphanLines && page.lines.length === 1 && i > 0) {
      // 前のページに余裕があれば移動
      const prevPage = optimizedPages[optimizedPages.length - 1]
      if (prevPage.lines.length < getMaxLinesPerPage(layoutConfig) - 1) {
        prevPage.lines.push(...page.lines)
        continue // このページはスキップ
      }
    }
    
    // 最後のページの調整
    if (i === pages.length - 1) {
      optimizedPage = optimizeLastPage(page, layoutConfig)
    }
    
    optimizedPages.push(optimizedPage)
  }
  
  return optimizedPages
}

/**
 * 最後のページを最適化
 */
function optimizeLastPage(page: PageLayout, _layoutConfig: LayoutConfig): PageLayout {
  // 最後のページの文字配置を中央寄せまたは均等配置
  const maxLines = getMaxLinesPerPage(layoutConfig)
  const currentLines = page.lines.length
  
  if (currentLines < maxLines / 2) {
    // 文字数が少ない場合は中央寄せ
    return centerAlignPage(page, layoutConfig)
  }
  
  return page
}

/**
 * ページの文字を中央寄せ
 */
function centerAlignPage(page: PageLayout, _layoutConfig: LayoutConfig): PageLayout {
  const printableHeight = A4_DIMENSIONS.HEIGHT - MARGINS.TOP - MARGINS.BOTTOM
  const lineHeight = ptToMm(layoutConfig.fontSize * 1.5)
  const totalContentHeight = page.lines.length * lineHeight
  const topOffset = (printableHeight - totalContentHeight) / 2
  
  return {
    lines: page.lines.map(line => ({
      characters: line.characters.map(char => ({
        ...char,
        y: char.y + topOffset
      }))
    }))
  }
}

/**
 * 1ページあたりの最大行数を取得
 */
function getMaxLinesPerPage(layoutConfig: LayoutConfig): number {
  const printableHeight = A4_DIMENSIONS.HEIGHT - MARGINS.TOP - MARGINS.BOTTOM
  const lineHeight = ptToMm(layoutConfig.fontSize * (
    layoutConfig.direction === 'horizontal' ? 1.5 : 1.2
  ))
  
  return Math.floor(printableHeight / lineHeight)
}

/**
 * 印刷品質を最適化するCSSを生成
 */
export function generateQualityOptimizedCSS(
  layoutConfig: LayoutConfig,
  options: PrintOptimizationOptions = {}
): string {
  const {
    enhanceTextQuality = true,
    optimizeForPrinter = 'auto',
    grayscaleMode = false,
    contrastAdjustment = 1.0
  } = options
  
  let css = `
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
  `
  
  // テキスト品質の向上
  if (enhanceTextQuality) {
    css += `
      .practice-character {
        text-rendering: optimizeLegibility !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
    `
  }
  
  // プリンター種別による最適化
  if (optimizeForPrinter === 'inkjet') {
    css += `
      .practice-character {
        font-weight: 200 !important;
        color: rgba(180, 180, 180, ${0.9 * contrastAdjustment}) !important;
      }
    `
  } else if (optimizeForPrinter === 'laser') {
    css += `
      .practice-character {
        font-weight: 100 !important;
        color: rgba(200, 200, 200, ${0.8 * contrastAdjustment}) !important;
      }
    `
  }
  
  // グレースケールモード
  if (grayscaleMode) {
    css += `
      * {
        filter: grayscale(100%) !important;
      }
    `
  }
  
  // コントラスト調整
  if (contrastAdjustment !== 1.0) {
    css += `
      .practice-character {
        filter: contrast(${contrastAdjustment * 100}%) !important;
      }
    `
  }
  
  css += `
    }
  `
  
  return css
}

/**
 * 印刷プレビュー用の最適化設定を取得
 */
export function getPreviewOptimizationSettings(
  layoutConfig: LayoutConfig
): PrintOptimizationOptions {
  return {
    adjustMargins: true,
    optimizePageBreaks: true,
    avoidOrphanLines: true,
    enhanceTextQuality: true,
    optimizeForPrinter: 'auto',
    contrastAdjustment: 1.0
  }
}

/**
 * 印刷時間を推定
 */
export function estimatePrintTime(
  totalPages: number,
  layoutConfig: LayoutConfig,
  printerType: 'inkjet' | 'laser' | 'unknown' = 'unknown'
): {
  estimatedMinutes: number
  factors: string[]
} {
  const factors: string[] = []
  let baseTimePerPage = 0.5 // 基本時間（分/ページ）
  
  // プリンター種別による調整
  switch (printerType) {
    case 'inkjet':
      baseTimePerPage = 0.8
      factors.push('インクジェットプリンター')
      break
    case 'laser':
      baseTimePerPage = 0.3
      factors.push('レーザープリンター')
      break
    default:
      factors.push('プリンター種別不明')
  }
  
  // フォントサイズによる調整
  if (layoutConfig.fontSize > 32) {
    baseTimePerPage *= 1.2
    factors.push('大きなフォントサイズ')
  }
  
  // 書き順表示による調整
  if (layoutConfig.showStrokeOrder) {
    baseTimePerPage *= 1.3
    factors.push('書き順番号表示')
  }
  
  const estimatedMinutes = Math.ceil(totalPages * baseTimePerPage)
  
  return {
    estimatedMinutes,
    factors
  }
}

/**
 * 印刷コスト推定
 */
export function estimatePrintCost(
  totalPages: number,
  options: {
    paperCostPerSheet?: number
    inkCostPerPage?: number
    currency?: string
  } = {}
): {
  totalCost: number
  breakdown: {
    paper: number
    ink: number
  }
  currency: string
} {
  const {
    paperCostPerSheet = 2, // 円/枚
    inkCostPerPage = 5,    // 円/ページ
    currency = '円'
  } = options
  
  const paperCost = totalPages * paperCostPerSheet
  const inkCost = totalPages * inkCostPerPage
  
  return {
    totalCost: paperCost + inkCost,
    breakdown: {
      paper: paperCost,
      ink: inkCost
    },
    currency
  }
}

/**
 * 印刷設定の推奨値を取得
 */
export function getRecommendedPrintSettings(
  _layoutConfig: LayoutConfig,
  printerType?: 'inkjet' | 'laser'
): PrintOptimizationOptions {
  const baseSettings: PrintOptimizationOptions = {
    adjustMargins: true,
    optimizePageBreaks: true,
    avoidOrphanLines: true,
    enhanceTextQuality: true,
    contrastAdjustment: 1.0
  }
  
  if (printerType === 'inkjet') {
    return {
      ...baseSettings,
      optimizeForPrinter: 'inkjet',
      contrastAdjustment: 1.1
    }
  }
  
  if (printerType === 'laser') {
    return {
      ...baseSettings,
      optimizeForPrinter: 'laser',
      contrastAdjustment: 0.9
    }
  }
  
  return {
    ...baseSettings,
    optimizeForPrinter: 'auto'
  }
}