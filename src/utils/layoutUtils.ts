import { UNIT_CONVERSION, A4_DIMENSIONS, MARGINS, PRINTABLE_AREA, LAYOUT_RATIOS } from '../constants/layout'
import { WritingDirection } from '../types'

/**
 * レイアウト計算用のユーティリティ関数群
 */

/**
 * ポイント（pt）をミリメートル（mm）に変換
 */
export function ptToMm(pt: number): number {
  return pt * UNIT_CONVERSION.PT_TO_MM
}

/**
 * ミリメートル（mm）をポイント（pt）に変換
 */
export function mmToPt(mm: number): number {
  return mm * UNIT_CONVERSION.MM_TO_PT
}

/**
 * ピクセル（px）をミリメートル（mm）に変換
 */
export function pxToMm(px: number): number {
  return px * UNIT_CONVERSION.PX_TO_MM
}

/**
 * ミリメートル（mm）をピクセル（px）に変換
 */
export function mmToPx(mm: number): number {
  return mm * UNIT_CONVERSION.MM_TO_PX
}

/**
 * フォントサイズ（pt）から文字の実際のサイズ（mm）を計算
 */
export function calculateCharacterSize(fontSize: number): { width: number; height: number } {
  const fontSizeMm = ptToMm(fontSize)
  
  // 日本語文字は正方形に近いため、幅と高さをほぼ同じに設定
  // 実際のフォントレンダリングを考慮して若干調整
  return {
    width: fontSizeMm * 0.9,   // 文字幅は若干狭め
    height: fontSizeMm         // 文字高さはフォントサイズと同じ
  }
}

/**
 * 書字方向に応じた行間を計算
 */
export function calculateLineSpacing(fontSize: number, direction: WritingDirection): number {
  const charSize = calculateCharacterSize(fontSize)
  const ratio = direction === 'horizontal' 
    ? LAYOUT_RATIOS.HORIZONTAL_LINE_HEIGHT 
    : LAYOUT_RATIOS.VERTICAL_LINE_HEIGHT
  
  return direction === 'horizontal' 
    ? charSize.height * ratio 
    : charSize.width * ratio
}

/**
 * 文字間隔を計算
 */
export function calculateCharacterSpacing(fontSize: number): number {
  const charSize = calculateCharacterSize(fontSize)
  return Math.max(charSize.width * LAYOUT_RATIOS.CHARACTER_SPACING, 1) // 最小1mm
}

/**
 * 横書きレイアウトでの1行あたりの文字数を計算
 */
export function calculateHorizontalCharsPerLine(fontSize: number): number {
  const charSize = calculateCharacterSize(fontSize)
  const charSpacing = calculateCharacterSpacing(fontSize)
  const totalCharWidth = charSize.width + charSpacing
  
  return Math.floor(PRINTABLE_AREA.WIDTH / totalCharWidth)
}

/**
 * 横書きレイアウトでの1ページあたりの行数を計算
 */
export function calculateHorizontalLinesPerPage(fontSize: number): number {
  const lineSpacing = calculateLineSpacing(fontSize, 'horizontal')
  
  return Math.floor(PRINTABLE_AREA.HEIGHT / lineSpacing)
}

/**
 * 縦書きレイアウトでの1行あたりの文字数を計算
 */
export function calculateVerticalCharsPerLine(fontSize: number): number {
  const charSize = calculateCharacterSize(fontSize)
  const charSpacing = calculateCharacterSpacing(fontSize)
  const totalCharHeight = charSize.height + charSpacing
  
  return Math.floor(PRINTABLE_AREA.HEIGHT / totalCharHeight)
}

/**
 * 縦書きレイアウトでの1ページあたりの行数を計算
 */
export function calculateVerticalLinesPerPage(fontSize: number): number {
  const lineSpacing = calculateLineSpacing(fontSize, 'vertical')
  
  return Math.floor(PRINTABLE_AREA.WIDTH / lineSpacing)
}

/**
 * 書字方向に応じた1行あたりの文字数を計算
 */
export function calculateCharsPerLine(fontSize: number, direction: WritingDirection): number {
  return direction === 'horizontal' 
    ? calculateHorizontalCharsPerLine(fontSize)
    : calculateVerticalCharsPerLine(fontSize)
}

/**
 * 書字方向に応じた1ページあたりの行数を計算
 */
export function calculateLinesPerPage(fontSize: number, direction: WritingDirection): number {
  return direction === 'horizontal'
    ? calculateHorizontalLinesPerPage(fontSize)
    : calculateVerticalLinesPerPage(fontSize)
}

/**
 * 文字の絶対座標を計算（横書き）
 */
export function calculateHorizontalCharPosition(
  lineIndex: number,
  charIndex: number,
  fontSize: number
): { x: number; y: number } {
  const charSize = calculateCharacterSize(fontSize)
  const charSpacing = calculateCharacterSpacing(fontSize)
  const lineSpacing = calculateLineSpacing(fontSize, 'horizontal')
  
  const x = MARGINS.LEFT + charIndex * (charSize.width + charSpacing)
  const y = MARGINS.TOP + lineIndex * lineSpacing
  
  return { x, y }
}

/**
 * 文字の絶対座標を計算（縦書き）
 */
export function calculateVerticalCharPosition(
  lineIndex: number,
  charIndex: number,
  fontSize: number
): { x: number; y: number } {
  const charSize = calculateCharacterSize(fontSize)
  const charSpacing = calculateCharacterSpacing(fontSize)
  const lineSpacing = calculateLineSpacing(fontSize, 'vertical')
  
  // 縦書きは右から左に行が進む
  const x = A4_DIMENSIONS.WIDTH - MARGINS.RIGHT - lineIndex * lineSpacing - charSize.width
  const y = MARGINS.TOP + charIndex * (charSize.height + charSpacing)
  
  return { x, y }
}

/**
 * 書字方向に応じた文字の絶対座標を計算
 */
export function calculateCharPosition(
  lineIndex: number,
  charIndex: number,
  fontSize: number,
  direction: WritingDirection
): { x: number; y: number } {
  return direction === 'horizontal'
    ? calculateHorizontalCharPosition(lineIndex, charIndex, fontSize)
    : calculateVerticalCharPosition(lineIndex, charIndex, fontSize)
}

/**
 * 必要なページ数を計算
 */
export function calculateRequiredPages(
  textLength: number,
  fontSize: number,
  direction: WritingDirection
): number {
  const charsPerLine = calculateCharsPerLine(fontSize, direction)
  const linesPerPage = calculateLinesPerPage(fontSize, direction)
  const charsPerPage = charsPerLine * linesPerPage
  
  return Math.ceil(textLength / charsPerPage)
}

/**
 * レイアウト情報のサマリーを取得
 */
export function getLayoutSummary(fontSize: number, direction: WritingDirection) {
  const charsPerLine = calculateCharsPerLine(fontSize, direction)
  const linesPerPage = calculateLinesPerPage(fontSize, direction)
  const charsPerPage = charsPerLine * linesPerPage
  
  return {
    fontSize,
    direction,
    charsPerLine,
    linesPerPage,
    charsPerPage,
    charSize: calculateCharacterSize(fontSize),
    lineSpacing: calculateLineSpacing(fontSize, direction),
    charSpacing: calculateCharacterSpacing(fontSize)
  }
}