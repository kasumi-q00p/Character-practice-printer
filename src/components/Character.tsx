import React from 'react'
import styled from 'styled-components'
import { CharacterPosition, WritingDirection, StrokeInfo } from '../types'
import { mmToPx } from '../utils/layoutUtils'

export interface CharacterProps {
  character: CharacterPosition
  fontSize: number
  writingDirection: WritingDirection
  showStrokeOrder?: boolean
  strokeOrder?: StrokeInfo[]
  isPreview?: boolean
}

interface StyledCharacterProps {
  $x: number
  $y: number
  $fontSize: number
  $writingDirection: WritingDirection
  $isPreview: boolean
}

const CharacterContainer = styled.div<StyledCharacterProps>`
  position: absolute;
  left: ${props => mmToPx(props.$x)}px;
  top: ${props => mmToPx(props.$y)}px;
  font-size: ${props => props.$fontSize}pt;
  font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif;
  color: ${props => props.$isPreview ? '#999' : '#ccc'};
  line-height: 1;
  user-select: none;
  writing-mode: ${props => props.$writingDirection === 'vertical' ? 'vertical-rl' : 'horizontal-tb'};
  text-orientation: ${props => props.$writingDirection === 'vertical' ? 'upright' : 'mixed'};
  
  /* 印刷時のスタイル */
  @media print {
    color: #ddd !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`

const CharacterText = styled.span`
  display: inline-block;
  font-weight: 300;
  letter-spacing: 0;
`

const StrokeOrderContainer = styled.div`
  position: relative;
  display: inline-block;
`

const StrokeOrderNumber = styled.span<{ $index: number; $total: number; $fontSize: number }>`
  position: absolute;
  font-size: ${props => Math.max(props.$fontSize * 0.25, 8)}pt;
  font-family: 'Arial', sans-serif;
  color: #ff6b6b;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: ${props => Math.max(props.$fontSize * 0.3, 12)}pt;
  height: ${props => Math.max(props.$fontSize * 0.3, 12)}pt;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  z-index: 10;
  
  /* 書き順番号の位置調整 */
  ${props => {
    const offset = props.$fontSize * 0.15
    const angle = (props.$index / props.$total) * 2 * Math.PI
    const radius = props.$fontSize * 0.4
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    
    return `
      left: ${x + offset}pt;
      top: ${y + offset}pt;
    `
  }}
  
  @media print {
    color: #ff6b6b !important;
    background: rgba(255, 255, 255, 0.9) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`

export const Character: React.FC<CharacterProps> = ({
  character,
  fontSize,
  writingDirection,
  showStrokeOrder = false,
  strokeOrder = [],
  isPreview = false
}) => {
  const renderCharacterWithStrokeOrder = () => {
    if (!showStrokeOrder || strokeOrder.length === 0) {
      return <CharacterText>{character.char}</CharacterText>
    }

    return (
      <StrokeOrderContainer>
        <CharacterText>{character.char}</CharacterText>
        {strokeOrder.map((stroke, index) => (
          <StrokeOrderNumber
            key={stroke.order}
            $index={index}
            $total={strokeOrder.length}
            $fontSize={fontSize}
          >
            {stroke.order}
          </StrokeOrderNumber>
        ))}
      </StrokeOrderContainer>
    )
  }

  return (
    <CharacterContainer
      $x={character.x}
      $y={character.y}
      $fontSize={fontSize}
      $writingDirection={writingDirection}
      $isPreview={isPreview}
    >
      {renderCharacterWithStrokeOrder()}
    </CharacterContainer>
  )
}

// 文字グリッド表示用のコンポーネント
export interface CharacterGridProps {
  characters: CharacterPosition[]
  fontSize: number
  writingDirection: WritingDirection
  showStrokeOrder?: boolean
  strokeOrderData?: Record<string, StrokeInfo[]>
  isPreview?: boolean
  className?: string
}

const GridContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

export const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  fontSize,
  writingDirection,
  showStrokeOrder = false,
  strokeOrderData = {},
  isPreview = false,
  className
}) => {
  return (
    <GridContainer className={className}>
      {characters.map((char, index) => (
        <Character
          key={`${char.char}-${index}-${char.x}-${char.y}`}
          character={char}
          fontSize={fontSize}
          writingDirection={writingDirection}
          showStrokeOrder={showStrokeOrder}
          strokeOrder={strokeOrderData[char.char] || []}
          isPreview={isPreview}
        />
      ))}
    </GridContainer>
  )
}

// 練習用の薄いガイド文字コンポーネント
export interface GuideCharacterProps {
  character: string
  x: number
  y: number
  fontSize: number
  writingDirection: WritingDirection
  opacity?: number
}

const GuideCharacterContainer = styled.div<{
  $x: number
  $y: number
  $fontSize: number
  $writingDirection: WritingDirection
  $opacity: number
}>`
  position: absolute;
  left: ${props => mmToPx(props.$x)}px;
  top: ${props => mmToPx(props.$y)}px;
  font-size: ${props => props.$fontSize}pt;
  font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif;
  color: rgba(200, 200, 200, ${props => props.$opacity});
  line-height: 1;
  user-select: none;
  pointer-events: none;
  writing-mode: ${props => props.$writingDirection === 'vertical' ? 'vertical-rl' : 'horizontal-tb'};
  text-orientation: ${props => props.$writingDirection === 'vertical' ? 'upright' : 'mixed'};
  font-weight: 100;
  
  @media print {
    color: rgba(220, 220, 220, ${props => props.$opacity}) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`

export const GuideCharacter: React.FC<GuideCharacterProps> = ({
  character,
  x,
  y,
  fontSize,
  writingDirection,
  opacity = 0.3
}) => {
  return (
    <GuideCharacterContainer
      $x={x}
      $y={y}
      $fontSize={fontSize}
      $writingDirection={writingDirection}
      $opacity={opacity}
    >
      {character}
    </GuideCharacterContainer>
  )
}