/**
 * レイアウト関連の定数定義
 */

// A4サイズ定数（mm）
export const A4_DIMENSIONS = {
  WIDTH: 210,   // mm
  HEIGHT: 297   // mm
} as const

// 余白設定（mm）
export const MARGINS = {
  TOP: 20,
  BOTTOM: 20,
  LEFT: 15,
  RIGHT: 15
} as const

// 印刷可能領域（mm）
export const PRINTABLE_AREA = {
  WIDTH: A4_DIMENSIONS.WIDTH - MARGINS.LEFT - MARGINS.RIGHT,   // 180mm
  HEIGHT: A4_DIMENSIONS.HEIGHT - MARGINS.TOP - MARGINS.BOTTOM  // 257mm
} as const

// フォントサイズ選択肢（pt）
export const FONT_SIZES = [12, 16, 20, 24, 32, 48, 72] as const

// レイアウト比率
export const LAYOUT_RATIOS = {
  // 横書き時の行間比率
  HORIZONTAL_LINE_HEIGHT: 1.5,
  // 縦書き時の行間比率  
  VERTICAL_LINE_HEIGHT: 1.2,
  // 文字間隔比率
  CHARACTER_SPACING: 0.1
} as const

// 単位変換定数
export const UNIT_CONVERSION = {
  // 1pt = 0.352778mm
  PT_TO_MM: 0.352778,
  // 1mm = 2.834646pt
  MM_TO_PT: 2.834646,
  // 1px = 0.264583mm (96dpi基準)
  PX_TO_MM: 0.264583,
  // 1mm = 3.779528px (96dpi基準)
  MM_TO_PX: 3.779528
} as const

// 最小・最大制限
export const LIMITS = {
  // 1行あたりの最小文字数
  MIN_CHARS_PER_LINE: 1,
  // 1行あたりの最大文字数
  MAX_CHARS_PER_LINE: 50,
  // 1ページあたりの最小行数
  MIN_LINES_PER_PAGE: 1,
  // 1ページあたりの最大行数
  MAX_LINES_PER_PAGE: 100
} as const

// デフォルト設定
export const DEFAULTS = {
  FONT_SIZE: 24,           // pt
  WRITING_DIRECTION: 'horizontal' as const,
  SHOW_STROKE_ORDER: false,
  CHARACTER_SPACING: 2,    // mm
  LINE_SPACING: 8          // mm
} as const