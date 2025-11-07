import React from 'react'
import styled from 'styled-components'
import { Header } from './Header'
import { InputPanel } from './InputPanel'
import { PreviewPanel } from './PreviewPanel'
import { PrintControls } from './PrintControls'
import { useInputValidation } from '../hooks/useInputValidation'
import { LayoutConfig } from '../types'

const AppWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const CharacterPracticeApp: React.FC = () => {
  const {
    inputText,
    writingDirection,
    fontSize,
    showStrokeOrder,
    validationResult,
    setInputText,
    setWritingDirection,
    setFontSize,
    setShowStrokeOrder
  } = useInputValidation({
    initialFontSize: 24,
    initialDirection: 'horizontal',
    enableRealTimeValidation: true,
    enableAutoSanitization: true
  })

  // レイアウト設定
  const layoutConfig: LayoutConfig = {
    direction: writingDirection,
    fontSize,
    showStrokeOrder,
    pageSize: 'A4'
  }

  // 総ページ数を計算
  const totalPages = inputText.trim() ? 
    Math.ceil(inputText.replace(/\s/g, '').length / 
      (Math.floor(180 / (fontSize * 0.4)) * Math.floor(257 / (fontSize * 0.5)))) : 0

  const handlePrintSuccess = () => {
    console.log('印刷が正常に完了しました')
  }

  const handlePrintError = (error: string) => {
    console.error('印刷エラー:', error)
  }

  return (
    <AppWrapper>
      <Header />
      <MainContent>
        <LeftPanel>
          <InputPanel
            inputText={inputText}
            writingDirection={writingDirection}
            fontSize={fontSize}
            showStrokeOrder={showStrokeOrder}
            validationResult={validationResult}
            onTextChange={setInputText}
            onDirectionChange={setWritingDirection}
            onFontSizeChange={setFontSize}
            onStrokeOrderToggle={setShowStrokeOrder}
          />
          <PrintControls 
            inputText={inputText}
            layoutConfig={layoutConfig}
            totalPages={totalPages}
            onPrintSuccess={handlePrintSuccess}
            onPrintError={handlePrintError}
          />
        </LeftPanel>
        <PreviewPanel
          inputText={inputText}
          layoutConfig={layoutConfig}
          validationResult={validationResult}
          showStrokeOrder={showStrokeOrder}
        />
      </MainContent>
    </AppWrapper>
  )
}