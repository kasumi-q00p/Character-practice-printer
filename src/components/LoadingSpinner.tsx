import React from 'react'
import styled, { keyframes } from 'styled-components'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  message?: string
  overlay?: boolean
  className?: string
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`

const LoadingContainer = styled.div<{ $overlay: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  
  ${props => props.$overlay && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
  `}
`

const Spinner = styled.div<{ 
  $size: 'small' | 'medium' | 'large'
  $color: string 
}>`
  width: ${props => {
    switch (props.$size) {
      case 'small': return '20px'
      case 'medium': return '40px'
      case 'large': return '60px'
      default: return '40px'
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'small': return '20px'
      case 'medium': return '40px'
      case 'large': return '60px'
      default: return '40px'
    }
  }};
  border: ${props => {
    const width = props.$size === 'small' ? '2px' : props.$size === 'large' ? '4px' : '3px'
    return `${width} solid #f3f3f3`
  }};
  border-top: ${props => {
    const width = props.$size === 'small' ? '2px' : props.$size === 'large' ? '4px' : '3px'
    return `${width} solid ${props.$color}`
  }};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

const LoadingMessage = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  color: #666;
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '0.8rem'
      case 'medium': return '1rem'
      case 'large': return '1.2rem'
      default: return '1rem'
    }
  }};
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
`

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#4CAF50',
  message,
  overlay = false,
  className
}) => {
  return (
    <LoadingContainer $overlay={overlay} className={className}>
      <Spinner $size={size} $color={color} />
      {message && (
        <LoadingMessage $size={size}>
          {message}
        </LoadingMessage>
      )}
    </LoadingContainer>
  )
}

// 特定用途向けのローディングコンポーネント
export const PrintingLoader: React.FC<{ progress?: number }> = ({ progress }) => {
  return (
    <LoadingSpinner
      size="large"
      color="#4CAF50"
      message={
        progress !== undefined 
          ? `印刷準備中... ${Math.round(progress)}%`
          : '印刷準備中...'
      }
      overlay={true}
    />
  )
}

export const FontLoadingLoader: React.FC = () => {
  return (
    <LoadingSpinner
      size="medium"
      color="#2196F3"
      message="フォントを読み込み中..."
    />
  )
}

export const LayoutCalculationLoader: React.FC = () => {
  return (
    <LoadingSpinner
      size="medium"
      color="#FF9800"
      message="レイアウトを計算中..."
    />
  )
}

// インライン用の小さなスピナー
export const InlineSpinner: React.FC<{ color?: string }> = ({ color = '#4CAF50' }) => {
  return (
    <Spinner 
      $size="small" 
      $color={color}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  )
}

// ボタン内で使用するスピナー
export const ButtonSpinner: React.FC<{ color?: string }> = ({ color = 'white' }) => {
  return (
    <Spinner 
      $size="small" 
      $color={color}
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle',
        marginRight: '8px'
      }}
    />
  )
}