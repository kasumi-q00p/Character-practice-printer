import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import styled, { keyframes } from 'styled-components'

// 通知の型定義
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// アニメーション
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`

// スタイルコンポーネント
const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`

const NotificationItem = styled.div<{ 
  $type: Notification['type']
  $isExiting: boolean 
}>`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success': return '#4CAF50'
      case 'error': return '#f44336'
      case 'warning': return '#ff9800'
      case 'info': return '#2196f3'
      default: return '#666'
    }
  }};
  animation: ${props => props.$isExiting ? slideOut : slideIn} 0.3s ease-out;
  position: relative;
`

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
`

const NotificationIcon = styled.div<{ $type: Notification['type'] }>`
  font-size: 1.2rem;
  margin-right: 12px;
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#4CAF50'
      case 'error': return '#f44336'
      case 'warning': return '#ff9800'
      case 'info': return '#2196f3'
      default: return '#666'
    }
  }};
`

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  flex: 1;
`

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #666;
  }
`

const ActionButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 8px;
  
  &:hover {
    background: #45a049;
  }
`

const ProgressBar = styled.div<{ $duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  width: 100%;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #4CAF50;
    width: 100%;
    animation: progress ${props => props.$duration}ms linear;
  }
  
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
`

// コンテキスト
interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  
  // ヘルパー関数
  showSuccess: (title: string, message?: string, options?: Partial<Notification>) => string
  showError: (title: string, message?: string, options?: Partial<Notification>) => string
  showWarning: (title: string, message?: string, options?: Partial<Notification>) => string
  showInfo: (title: string, message?: string, options?: Partial<Notification>) => string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// プロバイダー
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set())

  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId()
    const newNotification: Notification = {
      id,
      duration: 5000,
      persistent: false,
      ...notification
    }

    setNotifications(prev => [...prev, newNotification])

    // 自動削除（persistent でない場合）
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setExitingIds(prev => new Set(prev).add(id))
    
    // アニメーション完了後に実際に削除
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
      setExitingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, 300)
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setExitingIds(new Set())
  }, [])

  // ヘルパー関数
  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'success', title, message, ...options })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ 
      type: 'error', 
      title, 
      message, 
      duration: 8000, // エラーは長めに表示
      ...options 
    })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'warning', title, message, ...options })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'info', title, message, ...options })
  }, [addNotification])

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            $type={notification.type}
            $isExiting={exitingIds.has(notification.id)}
          >
            <NotificationHeader>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <NotificationIcon $type={notification.type}>
                  {getNotificationIcon(notification.type)}
                </NotificationIcon>
                <NotificationTitle>{notification.title}</NotificationTitle>
              </div>
              <CloseButton onClick={() => removeNotification(notification.id)}>
                ×
              </CloseButton>
            </NotificationHeader>
            
            {notification.message && (
              <NotificationMessage>{notification.message}</NotificationMessage>
            )}
            
            {notification.action && (
              <ActionButton onClick={notification.action.onClick}>
                {notification.action.label}
              </ActionButton>
            )}
            
            {!notification.persistent && notification.duration && (
              <ProgressBar $duration={notification.duration} />
            )}
          </NotificationItem>
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  )
}

// アイコンヘルパー
function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'warning': return '⚠'
    case 'info': return 'ℹ'
    default: return '•'
  }
}

// カスタムフック
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// 便利なヘルパーフック
export const useNotificationHelpers = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()

  const notifyPrintSuccess = () => {
    showSuccess('印刷完了', '練習シートの印刷が正常に完了しました')
  }

  const notifyPrintError = (error: string) => {
    showError('印刷エラー', error, {
      persistent: true,
      action: {
        label: '再試行',
        onClick: () => window.location.reload()
      }
    })
  }

  const notifyFontLoadError = () => {
    showWarning(
      'フォント読み込みエラー', 
      'フォントの読み込みに失敗しました。システムフォントを使用します。'
    )
  }

  const notifyValidationError = (errors: string[]) => {
    showError('入力エラー', errors.join(', '))
  }

  const notifyLayoutError = () => {
    showError(
      'レイアウトエラー', 
      'レイアウトの計算に失敗しました。設定を確認してください。'
    )
  }

  return {
    notifyPrintSuccess,
    notifyPrintError,
    notifyFontLoadError,
    notifyValidationError,
    notifyLayoutError,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}