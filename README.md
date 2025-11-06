# 文字練習プリンター

ひらがな、カタカナ、漢字の練習シートを作成するWebアプリケーションです。

## 機能

- 文字入力とプレビュー表示
- 用紙サイズとマス目サイズの選択
- 繰り返し回数の設定
- 印刷機能

## 技術スタック

- React 18
- TypeScript
- Vite
- Styled Components

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── CharacterPracticeApp.tsx
│   ├── Header.tsx
│   ├── CharacterInput.tsx
│   ├── PracticeSheetPreview.tsx
│   └── PrintControls.tsx
├── types/              # TypeScript型定義
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```