import React from 'react'
import styled from 'styled-components'

const PreviewContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 600px;
`

const PreviewTitle = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
`

const PreviewArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 1.1rem;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const PracticeSheetPreview: React.FC = () => {
  return (
    <PreviewContainer>
      <PreviewTitle>プレビュー</PreviewTitle>
      <PreviewArea>
        文字を入力すると、ここに練習シートのプレビューが表示されます
      </PreviewArea>
    </PreviewContainer>
  )
}