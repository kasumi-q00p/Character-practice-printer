import React from 'react'
import styled from 'styled-components'
import { CharacterPracticeApp } from './components/CharacterPracticeApp'

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
`

function App() {
  return (
    <AppContainer>
      <CharacterPracticeApp />
    </AppContainer>
  )
}

export default App