import React, { useEffect } from 'react'
import styled from 'styled-components'
import { AppProvider } from './contexts/AppContext'
import { ErrorBoundary, setupGlobalErrorHandlers } from './components/ErrorBoundary'
import { NotificationProvider } from './components/NotificationSystem'
import { CharacterPracticeApp } from './components/CharacterPracticeApp'
import { FontService } from './services/FontService'
import { LoadingSpinner } from './components/LoadingSpinner'
import './styles/print.css'
import './styles/responsive.css'
import './styles/accessibility.css'

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  background: #f8f9fa;
`

const AppContent = styled.div`
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

function AppInitializer() {
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [initError, setInitError] = React.useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // グローバルエラーハンドラーを設定
        setupGlobalErrorHandlers()

        // フォントサービスを初期化
        const fontService = FontService.getInstance()
        
        // 必須フォントを事前読み込み
        await fontService.preloadFontsForCharacterTypes(['hiragana', 'katakana', 'alphabet'])

        setIsInitialized(true)
      } catch (error) {
        console.error('App initialization failed:', error)
        setInitError(error instanceof Error ? error.message : 'アプリケーションの初期化に失敗しました')
      }
    }

    initializeApp()
  }, [])

  if (initError) {
    return (
      <AppContainer>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          background: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#cc3333', marginBottom: '16px' }}>
            初期化エラー
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {initError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            再読み込み
          </button>
        </div>
      </AppContainer>
    )
  }

  if (!isInitialized) {
    return (
      <AppContainer>
        <LoadingSpinner
          size="large"
          message="アプリケーションを初期化中..."
        />
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <AppContent>
        <CharacterPracticeApp />
      </AppContent>
    </AppContainer>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <NotificationProvider>
          <AppInitializer />
        </NotificationProvider>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App