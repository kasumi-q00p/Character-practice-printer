import React from 'react'
import styled from 'styled-components'
import { WritingDirection, ValidationResult } from '../types'

// Props interface for InputPanel component
export interface InputPanelProps {
  inputText: string
  writingDirection: WritingDirection
  fontSize: number
  showStrokeOrder: boolean
  validationResult?: ValidationResult
  onTextChange: (text: string) => void
  onDirectionChange: (direction: WritingDirection) => void
  onFontSizeChange: (size: number) => void
  onStrokeOrderToggle: (show: boolean) => void
}

// Styled components
const PanelContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const SectionTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
`

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const TextArea = styled.textarea<{ hasError?: boolean }>`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 2px solid ${props => props.hasError ? '#ff4444' : '#ddd'};
  border-radius: 4px;
  font-size: 1.1rem;
  font-family: 'Noto Sans JP', sans-serif;
  resize: vertical;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ff4444' : '#4CAF50'};
  }
`

const InputInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
`

const CharacterCount = styled.span<{ isOverLimit?: boolean }>`
  color: ${props => props.isOverLimit ? '#ff4444' : '#666'};
  font-weight: ${props => props.isOverLimit ? 'bold' : 'normal'};
`

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 0.85rem;
  margin-top: 4px;
`

const SettingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SettingLabel = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
`

const DirectionSelector = styled.div`
  display: flex;
  gap: 12px;
`

const DirectionButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${props => props.isActive ? '#4CAF50' : '#ddd'};
  background: ${props => props.isActive ? '#4CAF50' : 'white'};
  color: ${props => props.isActive ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4CAF50;
    background: ${props => props.isActive ? '#45a049' : '#f8f8f8'};
  }
`

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Slider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
    border: none;
  }
`

const FontSizeDisplay = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: 500;
  color: #333;
`

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`

const CheckboxLabel = styled.label`
  cursor: pointer;
  font-size: 0.95rem;
  color: #333;
`

// Font size constants
const FONT_SIZES = [12, 16, 20, 24, 32, 48, 72]
const MAX_CHARACTER_LIMIT = 500

export const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  writingDirection,
  fontSize,
  showStrokeOrder,
  validationResult,
  onTextChange,
  onDirectionChange,
  onFontSizeChange,
  onStrokeOrderToggle
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value)
  }

  const handleDirectionChange = (direction: WritingDirection) => {
    onDirectionChange(direction)
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sizeIndex = parseInt(e.target.value)
    onFontSizeChange(FONT_SIZES[sizeIndex])
  }

  const handleStrokeOrderToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStrokeOrderToggle(e.target.checked)
  }

  const currentFontSizeIndex = FONT_SIZES.indexOf(fontSize)
  const isOverLimit = inputText.length > MAX_CHARACTER_LIMIT
  const hasValidationErrors = validationResult && !validationResult.isValid

  return (
    <PanelContainer>
      <SectionTitle>文字入力・設定</SectionTitle>
      
      <InputSection>
        <SettingLabel htmlFor="text-input">練習したい文字を入力</SettingLabel>
        <TextArea
          id="text-input"
          value={inputText}
          onChange={handleTextChange}
          placeholder="ひらがな、カタカナ、アルファベットを入力してください..."
          hasError={hasValidationErrors || isOverLimit}
        />
        
        <InputInfo>
          <span>
            {validationResult?.primaryType && `文字種: ${getCharacterTypeLabel(validationResult.primaryType)}`}
          </span>
          <CharacterCount isOverLimit={isOverLimit}>
            {inputText.length} / {MAX_CHARACTER_LIMIT} 文字
          </CharacterCount>
        </InputInfo>
        
        {hasValidationErrors && (
          <ErrorMessage>
            {validationResult?.errors.join(', ')}
          </ErrorMessage>
        )}
        
        {isOverLimit && (
          <ErrorMessage>
            文字数が上限を超えています。{MAX_CHARACTER_LIMIT}文字以内で入力してください。
          </ErrorMessage>
        )}
      </InputSection>

      <SettingsSection>
        <SettingGroup>
          <SettingLabel>書字方向</SettingLabel>
          <DirectionSelector>
            <DirectionButton
              isActive={writingDirection === 'horizontal'}
              onClick={() => handleDirectionChange('horizontal')}
            >
              横書き
            </DirectionButton>
            <DirectionButton
              isActive={writingDirection === 'vertical'}
              onClick={() => handleDirectionChange('vertical')}
            >
              縦書き
            </DirectionButton>
          </DirectionSelector>
        </SettingGroup>

        <SettingGroup>
          <SettingLabel htmlFor="font-size-slider">文字サイズ</SettingLabel>
          <SliderContainer>
            <SliderWrapper>
              <span>小</span>
              <Slider
                id="font-size-slider"
                type="range"
                min="0"
                max={FONT_SIZES.length - 1}
                value={currentFontSizeIndex}
                onChange={handleFontSizeChange}
              />
              <span>大</span>
              <FontSizeDisplay>{fontSize}pt</FontSizeDisplay>
            </SliderWrapper>
          </SliderContainer>
        </SettingGroup>

        <SettingGroup>
          <CheckboxContainer>
            <Checkbox
              id="stroke-order-checkbox"
              type="checkbox"
              checked={showStrokeOrder}
              onChange={handleStrokeOrderToggle}
            />
            <CheckboxLabel htmlFor="stroke-order-checkbox">
              書き順番号を表示
            </CheckboxLabel>
          </CheckboxContainer>
        </SettingGroup>
      </SettingsSection>
    </PanelContainer>
  )
}

// Helper function to get character type label in Japanese
function getCharacterTypeLabel(type: string): string {
  switch (type) {
    case 'hiragana': return 'ひらがな'
    case 'katakana': return 'カタカナ'
    case 'alphabet': return 'アルファベット'
    case 'number': return '数字'
    case 'symbol': return '記号'
    case 'mixed': return '混在'
    default: return '不明'
  }
}