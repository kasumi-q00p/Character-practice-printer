import React from 'react'
import styled from 'styled-components'
import { Header } from './Header'
import { CharacterInput } from './CharacterInput'
import { PracticeSheetPreview } from './PracticeSheetPreview'
import { PrintControls } from './PrintControls'

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
  return (
    <AppWrapper>
      <Header />
      <MainContent>
        <LeftPanel>
          <CharacterInput />
          <PrintControls />
        </LeftPanel>
        <PracticeSheetPreview />
      </MainContent>
    </AppWrapper>
  )
}