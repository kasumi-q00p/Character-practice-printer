import React from 'react'
import styled from 'styled-components'
import { Header } from './Header'
import { InputPanel } from './InputPanel'
import { PracticeSheetPreview } from './PracticeSheetPreview'
import { PrintControls } from './PrintControls'
import { useInputValidation } from '../hooks/useInputValidation'

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
    setShowStrokeOrder,
    isPracticeReady
  } = useInputValidation({
    initialFontSize: 24,
    initialDirection: 'horizontal',
    enableRealTimeValidation: true,
    enableAutoSanitization: true
  })

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
          <PrintControls />
        </LeftPanel>
        <PracticeSheetPreview />
      </MainContent>
    </AppWrapper>
  )
}