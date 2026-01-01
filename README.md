# RichMoji

Slack用カスタム絵文字を作成するWebツール。テキストを入力してスタイルを調整するだけで、128x128pxのPNG/GIF絵文字を生成できます。

## 機能

### テキスト編集
- 複数行テキスト入力
- 5種類の日本語フォント（Noto Sans JP, M PLUS Rounded 1c, Noto Serif JP, Kiwi Maru, Reggae One）
- 文字サイズ調整（8px〜128px）+ 自動フィット
- 太字・斜体

### スタイリング
- 文字色（16色プリセット + カラーピッカー + 透明度）
- 背景色（透明対応）
- 縁取り（色・太さ調整可能）
- 影（なし/ソフト/ハード/長い）
- スタイルプリセット8種類

### 背景画像
- ファイル選択またはドラッグ&ドロップでアップロード
- リサイズ・位置調整・透明度設定
- LocalStorageに自動保存

### アニメーション
- 15種類のエフェクト（点滅、パルス、バウンス、揺れ、虹色、回転など）
- 複数エフェクト同時適用
- 速度調整（0.5x〜2.0x）
- リアルタイムプレビュー
- GIF出力対応

### 出力
- PNG形式（静止画）
- GIF形式（アニメーション時）
- 128x128px固定（Slack絵文字仕様）

## 技術スタック

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- HTML5 Canvas API
- gifenc（GIF生成）

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test

# ビルド結果プレビュー
npm run preview
```

## デプロイ

GitHub Pagesで静的サイトとして公開。

```bash
npm run build
# dist/ ディレクトリをGitHub Pagesにデプロイ
```

## ライセンス

MIT
