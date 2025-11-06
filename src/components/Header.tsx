import React from 'react'
import styled from 'styled-components'

const HeaderContainer = styled.header`
  text-align: center;
  padding: 20px 0;
  border-bottom: 2px solid #e0e0e0;
`

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 2.5rem;
  font-weight: bold;
`

const Subtitle = styled.p`
  margin: 10px 0 0 0;
  color: #666;
  font-size: 1.1rem;
`

export const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Title>文字練習プリンター</Title>
      <Subtitle>ひらがな・カタカナ・漢字の練習シートを作成</Subtitle>
    </HeaderContainer>
  )
}