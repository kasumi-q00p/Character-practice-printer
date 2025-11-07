import React from 'react'
import { createGlobalStyle } from 'styled-components'
import { WritingDirection } from '../types'

interface PrintStylesProps {
  fontSize: number
  writingDirection: WritingDirection
  showStrokeOrder: boolean
}

export const PrintStyles = createGlobalStyle<PrintStylesProps>`
  @media print {
    /* ページ設定 */
    @page {
      size: A4;
      margin: 20mm 15mm;
    }

    /* 基本設定 */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      width: 210mm !important;
      height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      font-size: ${props => props.fontSize}pt !important;
    }

    /* 印刷時に非表示 */
    .no-print,
    button,
    input,
    select,
    textarea,
    .sidebar,
    .controls,
    .header,
    nav {
      display: none !important;
    }

    /* 印刷対象 */
    .printable {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* 文字スタイル */
    .practice-character {
      color: #ddd !important;
      font-weight: 100 !important;
      writing-mode: ${props => props.writingDirection === 'vertical' ? 'vertical-rl' : 'horizontal-tb'} !important;
      text-orientation: ${props => props.writingDirection === 'vertical' ? 'upright' : 'mixed'} !important;
    }

    /* 書き順番号 */
    .stroke-order-number {
      color: #ff6b6b !important;
      background: rgba(255, 255, 255, 0.9) !important;
      display: ${props => props.showStrokeOrder ? 'flex' : 'none'} !important;
    }

    /* ページ分割 */
    .page-break {
      page-break-after: always !important;
    }

    .page-break:last-child {
      page-break-after: avoid !important;
    }
  }
`

// 印刷用のユーティリティコンポーネント
export const PrintContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="printable">
    {children}
  </div>
)

export const PrintPage: React.FC<{ 
  children: React.ReactNode
  isLastPage?: boolean 
}> = ({ children, isLastPage = false }) => (
  <div className={`print-page ${!isLastPage ? 'page-break' : ''}`}>
    {children}
  </div>
)

// 印刷時のみ表示されるコンポーネント
export const PrintOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="print-only" style={{ display: 'none' }}>
    {children}
  </div>
)

// 印刷時に非表示になるコンポーネント
export const NoPrint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="no-print">
    {children}
  </div>
)