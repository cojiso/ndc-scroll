# NDC Scroll

## 概要
### NDCとは
NDC（Nippon Decimal Classification; 日本十進分類法）とは、日本の図書館で広く使われている分類法です。NDC Scrollでは、日本図書館協会が提供するNDC9（日本十進分類法第9版）のデータを使用しています。

### NDC Scrollとは
NDC Scrollは、日本十進分類法（NDC）のデータを視覚化するWebアプリケーションです。NDCの階層構造を探索するための対話的なインターフェースを提供し、検索機能、詳細表示、階層表示のスティッキースクロールなどの機能を備えています。

## 利用者向け情報
### デモ
ライブデモ: https://ndc-scroll.pages.dev

### 特徴
- 日本十進分類法（NDC）第9版の利用と視覚化
- 階層構造の対話的な探索
- 特定の分類へ素早くアクセスするための検索機能
- 各分類項目の詳細表示
- ナビゲーション改善のためのスティッキースクロール
- デスクトップとモバイルデバイス両方に対応したレスポンシブデザイン

### 使用方法
1. デモサイト（https://ndc-scroll.pages.dev）にアクセスします。
2. 左側の検索バーを使用して特定の分類を検索するか、中央のリストをスクロールしてNDCの階層構造を探索します。
3. 項目をクリックすると、右側に詳細情報が表示されます。

### 先行プロジェクト
NDC Scrollは以下の先行アプリケーションにインスパイアされています：

- NDC Suggest: http://kuroyuri.media.osaka-cu.ac.jp/~ueda/ajax_ndc/
  開発: 大阪市立大学大学院創造都市研究科（学術情報総合センター）村上研究室
  特徴: Ajax技術を用いたNDC検索システム。NDC分類記号もしくはキーワードを入力すると関連する分類を表示する。

- NDC Navi: http://jasmine.media.osaka-cu.ac.jp/ndc_navi10/about
  開発: 村上晴美（大阪公立大学／大阪市立大学）・ 浦芳伸（winspire）
  特徴: NDC10（日本十進分類法10版）の電子化版であるNDC・MRDF10を探すことができる。相関索引の検索や、国立国会図書館サーチ、大阪公立大学蔵書検索（OPAC）との連携機能を提供。

## 開発者向け情報
### 技術スタック
- [Svelte](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/)
- TypeScript
- [Lucide Icons](https://lucide.dev/)

### 必要条件
- Node.js (v20.18.0 以降)
- npm (Node.jsに付属)

### セットアップ
#### インストール
1. リポジトリをクローンします：
``
git clone https://github.com/your-username/ndc9scroll.git
cd ndc9scroll
``

2. 依存関係をインストールします：
``
npm install
``

#### 開発サーバーの起動
``
npm run dev
``

ブラウザを開き、`http://localhost:5173`（または端末に表示されたポート）にアクセスします。

#### 本番用ビルド
アプリケーションの本番バージョンを作成するには：
``
npm run build
``
本番ビルドをプレビューするには：
``
npm run preview
``

### プロジェクト構造
- `src/routes/`: メインコンポーネントとページを含む
- `src/lib/`: ユーティリティ関数と型定義
- `src/store/`: 状態管理用のSvelteストア
- `static/`: 静的アセット（NDC9データを含む）

### 貢献方法
プロジェクトへの貢献を歓迎します。バグ報告、機能リクエスト、プルリクエストなどはGitHubのイシューやプルリクエスト機能を使用してください。

## プロジェクト情報
### ライセンス
このプロジェクトのソースコードはオープンソースで、[MITライセンス](LICENSE)の下で利用可能です。

NDC9のデータは日本図書館協会が提供するもので、[CC-BYライセンス](https://creativecommons.org/licenses/by/4.0/)の下で使用しています。詳細は[日本図書館協会のウェブサイト](https://www.jla.or.jp/committees/bunrui/tabid/789/Default.aspx)をご覧ください。

### 謝辞
- NDC9データは[日本図書館協会](https://www.jla.or.jp/)が提供するものを使用しています
- VSCodeのスティッキースクロール機能にインスパイアされています
- [国立国会図書館](https://www.ndl.go.jp/)のNDLSHデータを参照しています

### 連絡先
プロジェクトに関する質問や提案がある場合は、GitHubのイシューを作成するか、[プロジェクトのリポジトリ](https://github.com/your-username/ndc9scroll)にアクセスしてください。