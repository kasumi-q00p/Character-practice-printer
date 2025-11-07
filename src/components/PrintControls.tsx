import React, { useState } from 'react'
import styled from 'styled-components'
import { PrintService, PrintOptions } from '../services/PrintService'
import { LayoutConfig } from '../types'
import { getRecommendedPrintSettings, estimatePrintTime, estimatePrintCost } from '../utils/printOptimization'

const ControlsContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const ControlsTitle = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
`

const ControlGroup = styled.div`
  margin-bottom: 15px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
`

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`

const Button = styled.button<{ disabled?: boolean }>`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &.primary {
    background-color: #4CAF50;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #45a049;
    }
  }
  
  &.secondary {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover:not(:disabled) {
      background-color: #e8e8e8;
    }
  }
  
  &.danger {
    background-color: #ff4444;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #cc3333;
    }
  }
`

const Checkbox = styled.input`
  margin-right: 8px;
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 0.9rem;
`

const EstimationInfo = styled.div`
  background: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  margin: 16px 0;
  font-size: 0.85rem;
  color: #666;
`

const EstimationItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const ErrorMessage = styled.div`
  background: #fff5f5;
  color: #cc3333;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 8px 0;
  font-size: 0.85rem;
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

export interface PrintControlsProps {
  inputText: string
  layoutConfig: LayoutConfig
  totalPages: number
  onPrintSuccess?: () => void
  onPrintError?: (error: string) => void
}

export const PrintControls: React.FC<PrintControlsProps> = ({
  inputText,
  layoutConfig,
  totalPages,
  onPrintSuccess,
  onPrintError
}) => {
  const [printService] = useState(() => PrintService.getInstance())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 印刷オプション
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    title: '文字練習シート',
    grayscaleIntensity: 0.8,
    showGuideLines: true,
    useNewWindow: false
  })
  
  // プリンター種別
  const [printerType, setPrinterType] = useState<'inkjet' | 'laser' | 'auto'>('auto')
  
  // 推定情報
  const timeEstimation = estimatePrintTime(totalPages, layoutConfig, 
    printerType === 'auto' ? 'unknown' : printerType)
  const costEstimation = estimatePrintCost(totalPages)
  
  const canPrint = inputText.trim().length > 0 && totalPages > 0 && !isLoading

  const handlePrint = async () => {
    if (!canPrint) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const optimizedOptions = {
        ...printOptions,
        ...getRecommendedPrintSettings(layoutConfig, 
          printerType === 'auto' ? undefined : printerType)
      }
      
      const result = await printService.print(inputText, layoutConfig, optimizedOptions)
      
      if (result.success) {
        onPrintSuccess?.()
      } else {
        setError(result.error || '印刷に失敗しました')
        onPrintError?.(result.error || '印刷に失敗しました')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '印刷処理でエラーが発生しました'
      setError(errorMessage)
      onPrintError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = async () => {
    if (!canPrint) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await printService.showPrintPreview(inputText, layoutConfig, printOptions)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プレビュー生成でエラーが発生しました'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ControlsContainer>
      <ControlsTitle>印刷設定</ControlsTitle>
      
      <ControlGroup>
        <Label htmlFor="printer-type">プリンター種別</Label>
        <Select 
          id="printer-type" 
          value={printerType}
          onChange={(e) => setPrinterType(e.target.value as any)}
        >
          <option value="auto">自動判定</option>
          <option value="inkjet">インクジェット</option>
          <option value="laser">レーザー</option>
        </Select>
      </ControlGroup>
      
      <ControlGroup>
        <Label>印刷オプション</Label>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={printOptions.showGuideLines}
            onChange={(e) => setPrintOptions(prev => ({
              ...prev,
              showGuideLines: e.target.checked
            }))}
          />
          ガイドラインを表示
        </CheckboxLabel>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={printOptions.useNewWindow}
            onChange={(e) => setPrintOptions(prev => ({
              ...prev,
              useNewWindow: e.target.checked
            }))}
          />
          新しいウィンドウで印刷
        </CheckboxLabel>
      </ControlGroup>
      
      <ControlGroup>
        <Label htmlFor="grayscale-intensity">文字の濃さ</Label>
        <Select
          id="grayscale-intensity"
          value={printOptions.grayscaleIntensity}
          onChange={(e) => setPrintOptions(prev => ({
            ...prev,
            grayscaleIntensity: parseFloat(e.target.value)
          }))}
        >
          <option value="0.6">薄い</option>
          <option value="0.8">標準</option>
          <option value="1.0">濃い</option>
        </Select>
      </ControlGroup>
      
      {totalPages > 0 && (
        <EstimationInfo>
          <EstimationItem>
            <span>印刷ページ数:</span>
            <span>{totalPages}ページ</span>
          </EstimationItem>
          <EstimationItem>
            <span>推定印刷時間:</span>
            <span>{timeEstimation.estimatedMinutes}分</span>
          </EstimationItem>
          <EstimationItem>
            <span>推定コスト:</span>
            <span>{costEstimation.totalCost}{costEstimation.currency}</span>
          </EstimationItem>
        </EstimationInfo>
      )}
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      
      <ButtonGroup>
        <Button 
          className="secondary" 
          onClick={handlePreview}
          disabled={!canPrint}
        >
          {isLoading && <LoadingSpinner />}
          プレビュー
        </Button>
        <Button 
          className="primary" 
          onClick={handlePrint}
          disabled={!canPrint}
        >
          {isLoading && <LoadingSpinner />}
          印刷
        </Button>
      </ButtonGroup>
    </ControlsContainer>
  )
}