import React, { useMemo } from 'react'
import styled from 'styled-components'
import { LayoutConfig, LayoutResult, ValidationResult } from '../types'
import { LayoutService } from '../services/LayoutService'
import { PrintableSheet } from './PrintableSheet'
import { mmToPx } from '../utils/layoutUtils'
import { A4_DIMENSIONS } from '../constants/layout'

export interface PreviewPanelProps {
  inputText: string
  layoutConfig: LayoutConfig
  validationResult?: ValidationResult
  showStrokeOrder: boolean
  className?: string
}

const PreviewContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  
  @media (max-width: 968px) {
    order: 1;
    min-height: 400px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    min-height: 300px;
  }
`

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
`

const PreviewTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.3rem;
`

const PreviewInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: #666;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 4px;
  }
`

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`

const PreviewContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ScrollableArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  
  /* カスタムスクロールバー */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
`

const PageWrapper = styled.div<{ scale: number }>`
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  overflow: hidden;
  transform: scale(${props => props.scale});
  transform-origin: top center;
  margin-bottom: ${props => (1 - props.scale) * 200}px;
  
  /* A4サイズの比率を維持 */
  width: ${mmToPx(A4_DIMENSIONS.WIDTH)}px;
  height: ${mmToPx(A4_DIMENSIONS.HEIGHT)}px;
`

const PageNumber = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  margin-top: 8px;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  text-align: center;
`

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`

const EmptyMessage = styled.div`
  font-size: 1.1rem;
  margin-bottom: 8px;
`

const EmptySubMessage = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #ff4444;
  text-align: center;
  background: #fff5f5;
  border-radius: 4px;
  padding: 20px;
`

const ErrorIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 12px;
`

const ErrorMessage = styled.div`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 8px;
`

const ErrorDetails = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
`



export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  inputText,
  layoutConfig,
  validationResult,
  showStrokeOrder,
  className
}) => {
  // レイアウト計算
  const layoutResult = useMemo((): LayoutResult | null => {
    if (!inputText.trim() || (validationResult && !validationResult.isValid)) {
      return null
    }
    
    try {
      const characters = LayoutService.textToCharacterData(inputText)
      return LayoutService.calculateLayout(characters, layoutConfig)
    } catch (error) {
      console.error('Layout calculation failed:', error)
      return null
    }
  }, [inputText, layoutConfig, validationResult])

  // プレビュー情報の計算
  const previewInfo = useMemo(() => {
    if (!layoutResult) return null
    
    const totalCharacters = inputText.replace(/\s/g, '').length
    const { charsPerLine, linesPerPage, charsPerPage } = LayoutService.getLayoutPreview(
      totalCharacters,
      layoutConfig
    )
    
    return {
      totalCharacters,
      totalPages: layoutResult.totalPages,
      charsPerLine,
      linesPerPage,
      charsPerPage
    }
  }, [inputText, layoutConfig, layoutResult])

  // プレビュースケールの計算（固定値として設定）
  const previewScale = 0.6

  // エラー状態の判定
  const hasErrors = validationResult && !validationResult.isValid
  const isEmpty = !inputText.trim()

  const renderContent = () => {
    if (hasErrors) {
      return (
        <ErrorState>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorMessage>入力エラー</ErrorMessage>
          <ErrorDetails>
            {validationResult?.errors.join(', ')}
          </ErrorDetails>
        </ErrorState>
      )
    }

    if (isEmpty) {
      return (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyMessage>文字を入力してください</EmptyMessage>
          <EmptySubMessage>
            左側のパネルで練習したい文字を入力すると、<br />
            ここにプレビューが表示されます
          </EmptySubMessage>
        </EmptyState>
      )
    }

    if (!layoutResult) {
      return (
        <ErrorState>
          <ErrorIcon>❌</ErrorIcon>
          <ErrorMessage>レイアウト生成エラー</ErrorMessage>
          <ErrorDetails>
            プレビューの生成に失敗しました
          </ErrorDetails>
        </ErrorState>
      )
    }

    return (
      <PageContainer>
        {layoutResult.pages.map((page, pageIndex) => (
          <div key={pageIndex}>
            <PageWrapper scale={previewScale}>
              <PrintableSheet
                page={page}
                layoutConfig={layoutConfig}
                showStrokeOrder={showStrokeOrder}
                isPreview={true}
              />
            </PageWrapper>
            <PageNumber>
              ページ {pageIndex + 1} / {layoutResult.totalPages}
            </PageNumber>
          </div>
        ))}
      </PageContainer>
    )
  }

  return (
    <PreviewContainer className={className}>
      <PreviewHeader>
        <PreviewTitle>プレビュー</PreviewTitle>
        {previewInfo && (
          <PreviewInfo>
            <InfoItem>
              📄 {previewInfo.totalPages}ページ
            </InfoItem>
            <InfoItem>
              📝 {previewInfo.totalCharacters}文字
            </InfoItem>
            <InfoItem>
              📏 {previewInfo.charsPerLine}文字/行
            </InfoItem>
          </PreviewInfo>
        )}
      </PreviewHeader>
      
      <PreviewContent>
        <ScrollableArea>
          {renderContent()}
        </ScrollableArea>
      </PreviewContent>
    </PreviewContainer>
  )
}

// プレビューパネル用のフック
export const usePreviewPanel = (
  inputText: string,
  layoutConfig: LayoutConfig,
  validationResult?: ValidationResult
) => {
  const isReady = useMemo(() => {
    return inputText.trim().length > 0 && 
           (!validationResult || validationResult.isValid)
  }, [inputText, validationResult])

  const previewStats = useMemo(() => {
    if (!isReady) return null
    
    const totalCharacters = inputText.replace(/\s/g, '').length
    return LayoutService.getLayoutPreview(totalCharacters, layoutConfig)
  }, [inputText, layoutConfig, isReady])

  return {
    isReady,
    previewStats
  }
}