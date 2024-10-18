<!-- src/routes/about/+page.svelte -->

<script lang="ts">
  import { base } from '$app/paths';
  import HoverMenu from '../../components/HoverMenu.svelte';
</script>

<svelte:head>
  <title>About NDC Scroll</title>
</svelte:head>

<main class="about-page">
  <h1>NDC Scrollについて</h1>

  <p>
    NDC Scrollは、日本の公共図書館で広く使用されている分類方法、日本十進分類法（NDC）を視覚的に探索できるWebツールです。
  </p>

  <div class="image-container">
    <img src="ndc-scroll-screenshot.avif" alt="NDC Scroll Screenshot" class="screenshot" loading="lazy" />
  </div>

  <h2>NDCとは？</h2>
  <p>
    NDC（Nippon Decimal Classification; 日本十進分類法）は、図書館で本を整理するための「住所」のようなものです。
    例えば、「913.6」というNDC番号は、日本の現代小説を表しています。
  </p>
  <p>
    NDC Scrollでは、日本図書館協会が提供するNDC第9版のデータを使用しています。
  </p>

  <h2>このプロジェクトについて</h2>
  <p>
    NDC Scrollは、図書館情報学の学習や、本の分類に興味がある方々のために開発されました。NDCの構造を視覚的に理解することで、図書館での本の配架や、図書館学における分類の重要性をより深く理解することができます。
  </p>

  <h2>NDC Scrollの特徴</h2>
  <ul>
    <li><strong>視覚的なNDC探索</strong>: NDCの階層構造を見やすく表示し、簡単に閲覧できます。</li>
    <li><strong>効率的な検索</strong>: 特定の分類やキーワードを素早く見つけられます。</li>
    <li><strong>詳細情報の表示</strong>: 各分類項目の詳しい情報を確認できます。</li>
    <li><strong>使いやすいナビゲーション</strong>: VSCodeの機能を参考にしたスティッキースクロールで、大量の情報でも迷子になりません。</li>
    <li><strong>どこでも使える</strong>: スマートフォンやタブレットでも快適に使用できます。</li>
  </ul>

  <h2>先行プロジェクト</h2>
  <p>NDC Scrollは以下の先行ツールにインスパイアされています：</p>
  <ul>
    <li>
      <strong><a href="http://kuroyuri.media.osaka-cu.ac.jp/~ueda/ajax_ndc/" target="_blank" rel="noopener noreferrer">NDC Suggest</a></strong>
      <ul>
        <li>開発：大阪市立大学大学院創造都市研究科（学術情報総合センター）村上研究室</li>
        <li>特徴：Ajax技術を用いたNDC検索システム。NDC分類記号もしくはキーワードから関連分類を表示。</li>
      </ul>
    </li>
    <li>
      <strong><a href="http://jasmine.media.osaka-cu.ac.jp/ndc_navi10/about" target="_blank" rel="noopener noreferrer">NDC Navi</a></strong>
      <ul>
        <li>開発：村上晴美（大阪公立大学／大阪市立大学）・ 浦芳伸（winspire）</li>
        <li>特徴：NDC10の電子化版（NDC・MRDF10）探索、相関索引検索、国立国会図書館サーチ・大阪公立大学OPACとの連携。</li>
      </ul>
    </li>
  </ul>

  <h2>オープンソースプロジェクト</h2>
  <p>
    NDC Scrollはオープンソースプロジェクトとして公開されています。ソースコードは
    <a href="https://github.com/your-username/ndc9scroll" target="_blank" rel="noopener noreferrer">GitHubリポジトリ</a>
    で確認できます。プロジェクトへの貢献も歓迎しています。
  </p>

  <h2>謝辞</h2>
  <ul>
    <li>NDC9データは<a href="https://www.jla.or.jp/" target="_blank" rel="noopener noreferrer">日本図書館協会</a>が<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC-BYライセンス</a>で提供しているものを使用しています。</li>
    <li><a href="https://www.ndl.go.jp/" target="_blank" rel="noopener noreferrer">国立国会図書館</a>のNDLSHデータを参照しています。</li>
    <li>VSCodeのスティッキースクロール機能機能を参考にしています。</li>
    <li><a href="https://github.com/frogcat/ttl2jsonld" target="_blank" rel="noopener noreferrer">ttl2jsonld</a>を使用してTurtleファイルをJSONに変換しています。</li>
  </ul>

  <p>
    NDC Scrollを通じて、日本の図書館分類システムへの理解が深まり、図書館の世界がより身近になることを願っています。
  </p>

  <footer>
    <a href="{base}/">トップページに戻る</a>
  </footer>
</main>

<HoverMenu hideAboutButton={true} />

<style>
  :global(body) {
    overflow: auto !important;
  }

  .about-page {
    overflow: auto;
    max-width: 560px;
    width: 90%;
    margin: 0 auto;
    padding: 20px;
    line-height: 1.6;
    height: 100%;
  }

  @media (max-width: 768px) {
    .about-page {
      max-width: 560px;
    }
  }

  @media (max-width: 480px) {
    .about-page {
      width: 95%;
      max-width: 420px;
      padding: 15px;
    }
  }

  footer {
    margin: 40px 0 60px 0;
    text-align: center;
  }

  h1 {
    color: var(--color-primary);
    text-align: center;
    margin: 60px 0 40px 0;
  }

  h2 {
    margin-top: 30px;
    color: var(--color-text);
  }

  ul {
    padding-left: 20px;
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .image-container {
    width: 100%;
    padding-top: 76.21%;
    position: relative;
    margin: 20px 0;
    background-color: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .screenshot {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
</style>