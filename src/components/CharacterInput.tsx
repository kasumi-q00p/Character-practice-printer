import React from 'react'
import styled from 'styled-components'

const InputContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const InputTitle = styled.h2`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.3rem;
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1.1rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`

const CharacterCount = styled.div`
  margin-top: 8px;
  text-align: right;
  color: #666;
  font-size: 0.9rem;
`

export const CharacterInput: React.FC = () => {
  const [text, setText] = React.useState('')

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  return (
    <InputContainer>
      <InputTitle>練習したい文字を入力</InputTitle>
      <TextArea
        value={text}
        onChange={handleTextChange}
        placeholder="ひらがな、カタカナ、漢字を入力してください..."
      />
      <CharacterCount>
        {text.length} 文字
      </CharacterCount>
    </InputContainer>
  )
}