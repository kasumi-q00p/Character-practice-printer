import React, { Component, ErrorInfo, ReactNode } from 'react'
import styled from 'styled-components'
import { ErrorType, AppError } from '../types'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: AppError) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  text-align: center;
  background: #fff5f5;
  border-radius: 8px;
  margin: 20px;
`

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  color: #ff4444;
`

const ErrorTitle = styled.h2`
  color: #cc3333;
  margin-bottom: 16px;
  font-size: 1.5rem;
`

const ErrorMessage = styled.p`
  color: #666;
  margin-bottom: 24px;
  max-width: 500px;
  line-height: 1.6;
`

const ErrorDetails = styled.details`
  margin-top: 20px;
  text-align: left;
  max-width: 600px;
  
  summary {
    cursor: pointer;
    color: #666;
    margin-bottom: 10px;
    
    &:hover {
      color: #333;
    }
  }
`

const ErrorStack = styled.pre`
  background: #f8f8f8;
  padding: 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  overflow-x: auto;
  color: #666;
  border-left: 3px solid #ff4444;
`

const ActionButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin: 0 8px;
  
  &:hover {
    background: #45a049;
  }
  
  &.secondary {
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover {
      background: #e8e8e8;
    }
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // エラーをログに記録
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // 親コンポーネントにエラーを通知
    if (this.props.onError) {
      const appError: AppError = {
        type: ErrorType.LAYOUT_ERROR,
        message: error.message,
        details: {
          stack: error.stack,
          componentStack: errorInfo.componentStack
        }
      }
      this.props.onError(appError)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIがある場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトのエラーUI
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>アプリケーションエラーが発生しました</ErrorTitle>
          <ErrorMessage>
            申し訳ございません。予期しないエラーが発生しました。
            ページを再読み込みするか、しばらく時間をおいてから再度お試しください。
          </ErrorMessage>
          
          <ButtonGroup>
            <ActionButton onClick={this.handleReset}>
              再試行
            </ActionButton>
            <ActionButton className="secondary" onClick={this.handleReload}>
              ページを再読み込み
            </ActionButton>
          </ButtonGroup>

          {this.state.error && (
            <ErrorDetails>
              <summary>エラーの詳細情報</summary>
              <div>
                <strong>エラーメッセージ:</strong>
                <p>{this.state.error.message}</p>
                
                {this.state.error.stack && (
                  <>
                    <strong>スタックトレース:</strong>
                    <ErrorStack>{this.state.error.stack}</ErrorStack>
                  </>
                )}
                
                {this.state.errorInfo?.componentStack && (
                  <>
                    <strong>コンポーネントスタック:</strong>
                    <ErrorStack>{this.state.errorInfo.componentStack}</ErrorStack>
                  </>
                )}
              </div>
            </ErrorDetails>
          )}
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

// 関数コンポーネント用のエラーハンドリングフック
export const useErrorHandler = () => {
  const handleError = (error: Error, _errorInfo?: string) => {
    console.error('Error caught by useErrorHandler:', error)
    
    // エラーレポートサービスに送信（実装時）
    // reportError(error, errorInfo)
  }

  return handleError
}

// 非同期エラー用のハンドラー
export const handleAsyncError = (error: Error, context?: string) => {
  console.error(`Async error in ${context || 'unknown context'}:`, error)
  
  // グローバルエラーハンドラーに通知
  window.dispatchEvent(new CustomEvent('app-error', {
    detail: {
      error,
      context,
      timestamp: new Date().toISOString()
    }
  }))
}

// グローバルエラーハンドラーの設定
export const setupGlobalErrorHandlers = () => {
  // 未処理のPromise拒否をキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    handleAsyncError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      'unhandled promise rejection'
    )
  })

  // 一般的なJavaScriptエラーをキャッチ
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    handleAsyncError(event.error, 'global error handler')
  })

  // カスタムアプリエラーイベントをリッスン
  window.addEventListener('app-error', (event: any) => {
    const { error, context, timestamp } = event.detail
    console.error(`App error at ${timestamp} in ${context}:`, error)
  })
}