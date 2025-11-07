import React, { useMemo } from 'react'
import styled from 'styled-components'
import { PageLayout, LayoutConfig, CharacterPosition } from '../types'
import { CharacterGrid } from './Character'
import { StrokeOrderService } from '../services/StrokeOrderService'
import { FontService } from '../services/FontService'
import { mmToPx } from '../utils/layoutUtils'
import { A4_DIMENSIONS, MARGINS } from '../constants/layout'

export interface PrintableSheetProps {
  page: PageLayout
  layoutConfig: LayoutConfig
  showStrokeOrder: boolean
  isPreview?: boolean
  className?: string
}

interface SheetContainerProps {
  $isPreview: boolean
}

const SheetContainer = styled.div<SheetContainerProps>`
  position: relative;
  width: ${mmToPx(A4_DIMENSIONS.WIDTH)}px;
  height: ${mmToPx(A4_DIMENSIONS.HEIGHT)}px;
  background: white;
  overflow: visible;
  
  /* 印刷時の設定 */
  @media print {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    page-break-after: always;
    
    &:last-child {
      page-break-after: avoid;
    }
  }
  
  /* プレビュー時の設定 */
  ${props => props.$isPreview && `
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `}
`

const ContentArea = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  
  @media print {
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }
`

const GuideLines = styled.div<{ $direction: 'horizontal' | 'vertical'; $fontSize: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.1;
  
  /* 横書き用のガイドライン */
  ${props => props.$direction === 'horizontal' && `
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent ${props.$fontSize * 1.5 - 1}pt,
      #ccc ${props.$fontSize * 1.5 - 1}pt,
      #ccc ${props.$fontSize * 1.5}pt
    );
  `}
  
  /* 縦書き用のガイドライン */
  ${props => props.$direction === 'vertical' && `
    background-image: repeating-linear-gradient(
      to left,
      transparent 0,
      transparent ${props.$fontSize * 1.2 - 1}pt,
      #ccc ${props.$fontSize * 1.2 - 1}pt,
      #ccc ${props.$fontSize * 1.2}pt
    );
  `}
  
  @media print {
    opacity: 0.05 !important;
  }
`

const CharacterLayer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
`

const DebugInfo = styled.div<{ $isPreview: boolean }>`
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 8pt;
  color: #999;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 2px;
  display: ${props => props.$isPreview ? 'block' : 'none'};
  
  @media print {
    display: none !important;
  }
`

export const PrintableSheet: React.FC<PrintableSheetProps> = ({
  page,
  layoutConfig,
  showStrokeOrder,
  isPreview = false,
  className
}) => {
  const strokeOrderService = StrokeOrderService.getInstance()
  const fontService = FontService.getInstance()

  // 全文字の配列を作成
  const allCharacters = useMemo((): CharacterPosition[] => {
    const characters: CharacterPosition[] = []
    
    page.lines.forEach(line => {
      characters.push(...line.characters)
    })
    
    return characters
  }, [page])

  // 書き順データを取得
  const strokeOrderData = useMemo(() => {
    if (!showStrokeOrder) return {}
    
    const uniqueChars = [...new Set(allCharacters.map(char => char.char))]
    return strokeOrderService.getMultipleStrokeOrders(uniqueChars)
  }, [allCharacters, showStrokeOrder, strokeOrderService])

  // フォント設定
  const fontFamily = useMemo(() => {
    // 文字種を判定してフォントを選択
    const characterTypes = allCharacters.map(char => {
      if (/[\u3040-\u309F]/.test(char.char)) return 'hiragana'
      if (/[\u30A0-\u30FF]/.test(char.char)) return 'katakana'
      if (/[A-Za-z]/.test(char.char)) return 'alphabet'
      if (/[0-9]/.test(char.char)) return 'number'
      return 'mixed'
    })
    
    return fontService.generateCSSFontFamily(characterTypes)
  }, [allCharacters, fontService])

  // デバッグ情報
  const debugInfo = useMemo(() => {
    if (!isPreview) return null
    
    return {
      characters: allCharacters.length,
      lines: page.lines.length,
      fontSize: layoutConfig.fontSize,
      direction: layoutConfig.direction,
      strokeOrder: showStrokeOrder ? 'ON' : 'OFF'
    }
  }, [allCharacters.length, page.lines.length, layoutConfig, showStrokeOrder, isPreview])

  return (
    <SheetContainer 
      $isPreview={isPreview}
      className={`printable-sheet ${className || ''}`}
      style={{ fontFamily }}
    >
      <ContentArea>
        {/* ガイドライン */}
        <GuideLines 
          $direction={layoutConfig.direction}
          $fontSize={layoutConfig.fontSize}
        />
        
        {/* 文字レイヤー */}
        <CharacterLayer>
          <CharacterGrid
            characters={allCharacters}
            fontSize={layoutConfig.fontSize}
            writingDirection={layoutConfig.direction}
            showStrokeOrder={showStrokeOrder}
            strokeOrderData={strokeOrderData}
            isPreview={isPreview}
          />
        </CharacterLayer>
        
        {/* デバッグ情報 */}
        {debugInfo && (
          <DebugInfo $isPreview={isPreview}>
            {debugInfo.characters}文字 | {debugInfo.lines}行 | 
            {debugInfo.fontSize}pt | {debugInfo.direction} | 
            書順:{debugInfo.strokeOrder}
          </DebugInfo>
        )}
      </ContentArea>
    </SheetContainer>
  )
}

// 複数ページ用のコンテナコンポーネント
export interface PrintableSheetsProps {
  pages: PageLayout[]
  layoutConfig: LayoutConfig
  showStrokeOrder: boolean
  isPreview?: boolean
  className?: string
}

const SheetsContainer = styled.div<{ $isPreview: boolean }>`
  ${props => props.$isPreview ? `
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    padding: 20px;
  ` : `
    @media print {
      display: block;
    }
  `}
`

export const PrintableSheets: React.FC<PrintableSheetsProps> = ({
  pages,
  layoutConfig,
  showStrokeOrder,
  isPreview = false,
  className
}) => {
  return (
    <SheetsContainer $isPreview={isPreview} className={className}>
      {pages.map((page, index) => (
        <PrintableSheet
          key={index}
          page={page}
          layoutConfig={layoutConfig}
          showStrokeOrder={showStrokeOrder}
          isPreview={isPreview}
        />
      ))}
    </SheetsContainer>
  )
}

// 印刷専用のラッパーコンポーネント
export const PrintOnlySheets: React.FC<PrintableSheetsProps> = (props) => {
  return (
    <div className="print-only" style={{ display: 'none' }}>
      <PrintableSheets {...props} isPreview={false} />
    </div>
  )
}

// プレビュー専用のラッパーコンポーネント
export const PreviewOnlySheets: React.FC<PrintableSheetsProps> = (props) => {
  return (
    <div className="no-print">
      <PrintableSheets {...props} isPreview={true} />
    </div>
  )
}