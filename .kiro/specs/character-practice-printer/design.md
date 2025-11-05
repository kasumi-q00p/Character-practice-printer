# 設計書

## 概要

文字練習プリント作成システムは、Webブラウザ上で動作するSPA（Single Page Application）として実装します。ユーザーが入力した文字列を基に、なぞり書き用のA4サイズプリントをリアルタイムで生成し、印刷可能な形式で提供します。

## アーキテクチャ

### システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Font Service  │    │  Print Service  │
│   (React/Vue)   │◄──►│   (Web Fonts)   │◄──►│   (CSS Print)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Input Handler  │    │ Character Data  │    │ Layout Engine   │
│                 │    │   (Stroke Info) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック

- **フロントエンド**: React + TypeScript
- **スタイリング**: CSS-in-JS (styled-components) + CSS Grid/Flexbox
- **フォント**: Google Fonts (Noto Sans JP, Noto Sans)
- **印刷**: CSS @media print + HTML Canvas (必要に応じて)
- **書き順データ**: 静的JSONファイル
- **ビルドツール**: Vite
- **パッケージマネージャー**: npm

## コンポーネントとインターフェース

### 主要コンポーネント

#### 1. App Component
```typescript
interface AppProps {}
interface AppState {
  inputText: string;
  writingDirection: 'horizontal' | 'vertical';
  characterType: 'hiragana' | 'katakana' | 'alphabet' | 'mixed';
  fontSize: number;
  showStrokeOrder: boolean;
}
```

#### 2. InputPanel Component
```typescript
interface InputPanelProps {
  inputText: string;
  writingDirection: 'horizontal' | 'vertical';
  fontSize: number;
  showStrokeOrder: boolean;
  onTextChange: (text: string) => void;
  onDirectionChange: (direction: 'horizontal' | 'vertical') => void;
  onFontSizeChange: (size: number) => void;
  onStrokeOrderToggle: (show: boolean) => void;
}
```

#### 3. PreviewPanel Component
```typescript
interface PreviewPanelProps {
  inputText: string;
  writingDirection: 'horizontal' | 'vertical';
  fontSize: number;
  showStrokeOrder: boolean;
}
```

#### 4. PrintableSheet Component
```typescript
interface PrintableSheetProps {
  characters: CharacterData[];
  layout: LayoutConfig;
}

interface CharacterData {
  char: string;
  type: 'hiragana' | 'katakana' | 'alphabet';
  strokeOrder?: StrokeInfo[];
}

interface LayoutConfig {
  direction: 'horizontal' | 'vertical';
  fontSize: number;
  showStrokeOrder: boolean;
  pageSize: 'A4';
}
```

#### 5. Character Component
```typescript
interface CharacterProps {
  char: string;
  fontSize: number;
  showStrokeOrder: boolean;
  strokeOrder?: StrokeInfo[];
}

interface StrokeInfo {
  order: number;
  path: string; // SVG path for stroke
  position: { x: number; y: number };
}
```

### サービスクラス

#### FontService
```typescript
class FontService {
  static loadFonts(): Promise<void>;
  static getFontFamily(characterType: string): string;
  static calculateCharacterDimensions(char: string, fontSize: number): Dimensions;
}
```

#### LayoutService
```typescript
class LayoutService {
  static calculateLayout(
    text: string, 
    config: LayoutConfig
  ): LayoutResult;
  
  static getCharactersPerLine(fontSize: number, direction: string): number;
  static getLinesPerPage(fontSize: number, direction: string): number;
}

interface LayoutResult {
  pages: PageLayout[];
  totalPages: number;
}

interface PageLayout {
  lines: LineLayout[];
}

interface LineLayout {
  characters: CharacterPosition[];
}

interface CharacterPosition {
  char: string;
  x: number;
  y: number;
}
```

#### StrokeOrderService
```typescript
class StrokeOrderService {
  static getStrokeOrder(char: string): StrokeInfo[] | null;
  static loadStrokeData(): Promise<void>;
}
```

#### PrintService
```typescript
class PrintService {
  static generatePrintableHTML(layout: LayoutResult): string;
  static openPrintDialog(): void;
  static exportAsPDF(): Promise<Blob>; // 将来的な拡張
}
```

## データモデル

### 文字種判定
```typescript
enum CharacterType {
  HIRAGANA = 'hiragana',
  KATAKANA = 'katakana', 
  ALPHABET = 'alphabet',
  NUMBER = 'number',
  SYMBOL = 'symbol'
}

class CharacterAnalyzer {
  static detectType(char: string): CharacterType;
  static isJapanese(char: string): boolean;
  static requiresStrokeOrder(char: string): boolean;
}
```

### 書き順データ構造
```typescript
interface StrokeOrderData {
  [character: string]: {
    strokes: StrokeInfo[];
    totalStrokes: number;
  };
}

interface StrokeInfo {
  order: number;
  path: string; // SVG path
  position: { x: number; y: number }; // 番号表示位置
}
```

### レイアウト設定
```typescript
interface LayoutConstants {
  A4_WIDTH: 210; // mm
  A4_HEIGHT: 297; // mm
  MARGIN_TOP: 20; // mm
  MARGIN_BOTTOM: 20; // mm
  MARGIN_LEFT: 15; // mm
  MARGIN_RIGHT: 15; // mm
  
  FONT_SIZES: number[]; // [12, 16, 20, 24, 32, 48, 72]
  
  HORIZONTAL_LINE_HEIGHT_RATIO: 1.5;
  VERTICAL_LINE_HEIGHT_RATIO: 1.2;
  CHARACTER_SPACING_RATIO: 0.1;
}
```

## エラーハンドリング

### エラータイプ
```typescript
enum ErrorType {
  INVALID_INPUT = 'INVALID_INPUT',
  FONT_LOAD_ERROR = 'FONT_LOAD_ERROR',
  LAYOUT_ERROR = 'LAYOUT_ERROR',
  PRINT_ERROR = 'PRINT_ERROR'
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}
```

### エラーハンドリング戦略
- 入力検証エラー: リアルタイムでユーザーにフィードバック
- フォント読み込みエラー: フォールバックフォントを使用
- レイアウトエラー: デフォルト設定にリセット
- 印刷エラー: エラーメッセージ表示とリトライオプション

## テスト戦略

### 単体テスト
- CharacterAnalyzer: 文字種判定ロジック
- LayoutService: レイアウト計算ロジック
- StrokeOrderService: 書き順データ取得

### 統合テスト
- コンポーネント間の連携
- フォント読み込みとレンダリング
- 印刷機能の動作確認

### E2Eテスト
- ユーザーワークフロー全体
- 異なるブラウザでの印刷動作
- レスポンシブデザインの確認

### 印刷テスト
- 実際の印刷結果の確認
- 異なる用紙サイズでの動作
- ブラウザ間の印刷差異の検証

## パフォーマンス考慮事項

### 最適化戦略
- フォントの遅延読み込み
- 書き順データの必要時読み込み
- レイアウト計算結果のメモ化
- 大量文字入力時の仮想化

### メモリ管理
- 不要なDOM要素の削除
- イベントリスナーの適切なクリーンアップ
- 大きな文字列処理時のチャンク分割

## セキュリティ考慮事項

### 入力検証
- XSS攻撃防止のための入力サニタイズ
- 文字数制限の実装
- 不正な文字コードの除外

### データ保護
- ユーザー入力データの非永続化
- ローカルストレージの最小限使用
- 機密情報の非保存