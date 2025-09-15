=== NS Media Hero Showcase ===
Contributors: netservice
Tags: hero, showcase, media, gallery, animation
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 0.01
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

ヒーロー領域で画像/動画タイルが順番にズーム→全画面→戻るを繰り返すショーケース機能を提供します。

== Description ==

NS Media Hero Showcaseは、トップページのヒーロー領域で魅力的なメディアショーケースを作成するためのWordPressプラグインです。

= 主な機能 =

* **レスポンシブグリッド**: PC/タブレット/スマホで異なるグリッドレイアウト（3x2～5x4）
* **画像・動画対応**: 画像とMP4動画の混在表示が可能
* **アニメーション**: タイルが順番にズーム→全画面→戻るアニメーション
* **カスタマイズ**: 速度・透過度・ブラー効果の調整可能
* **多層構造**: 背景メディア/中間レイヤー/最上レイヤーの重ね合わせ
* **アクセシビリティ**: prefers-reduced-motion対応、キーボードナビゲーション
* **パフォーマンス**: IntersectionObserver、非表示時の動画停止

= 使用方法 =

1. プラグインを有効化
2. 設定 > Media Hero Showcaseで詳細設定
3. Gutenbergブロックまたはショートコード `[ns_media_hero_showcase]` で表示

= レイヤー構成 =

* **最下層**: 画像/動画タイル（ズーム対象）
* **中間層**: シャドウオーバーレイ、任意の背景動画
* **最上層**: タイトル/サブタイトル/CTAボタン/ロゴ

= カスタマイズ設定 =

* グリッドサイズ（PC/タブレット/スマホ別）
* アニメーション順序（左→右、右→左）
* タイミング（表示時間、ズーム速度）
* エフェクト（透明度、ブラー）
* テキスト・ロゴ・CTAの設定

== Installation ==

1. プラグインファイルを `/wp-content/plugins/ns-media-hero-showcase/` にアップロード
2. WordPressの管理画面でプラグインを有効化
3. 設定 > Media Hero Showcaseで初期設定を行う

== Frequently Asked Questions ==

= どのような動画形式に対応していますか？ =

MP4（H.264）とWebM（VP9/AV1）に対応しています。ポスター画像（静止画）の設定を推奨します。

= モバイルでの動作は？ =

はい、レスポンシブ対応でPC/タブレット/スマホそれぞれ異なるグリッドサイズを設定できます。

= 動画の音声は再生されますか？ =

いいえ、自動再生ブロックを避けるため、すべての動画はミュート再生されます。

= アクセシビリティ対応は？ =

prefers-reduced-motion設定に対応し、動きを減らしたアニメーションに切り替わります。キーボードナビゲーションにも対応しています。

= パフォーマンスへの影響は？ =

IntersectionObserverで画面外では動作を停止し、必要最小限のメディアのみプリロードするため、パフォーマンス負荷を抑えています。

== Screenshots ==

1. フロントエンドでのヒーローショーケース表示
2. 管理画面でのメディア設定
3. Gutenbergブロックエディター
4. レスポンシブ表示（モバイル）

== Changelog ==

= 0.01 =
* 初回リリース
* 基本的なヒーローショーケース機能
* Gutenbergブロック対応
* ショートコード対応
* レスポンシブグリッド
* アクセシビリティ対応

== Upgrade Notice ==

= 0.01 =
初回リリース版です。

== Developer Notes ==

= フック =

プラグインは以下のWordPressフックを使用します：

* `plugins_loaded` - プラグイン初期化
* `wp_enqueue_scripts` - フロントエンドアセット読み込み
* `admin_enqueue_scripts` - 管理画面アセット読み込み
* `init` - ブロック・ショートコード登録

= CSS カスタムプロパティ =

以下のCSS変数でカスタマイズ可能：

* `--nsmhs-display-duration` - 表示時間
* `--nsmhs-zoom-in-duration` - ズームイン時間
* `--nsmhs-zoom-out-duration` - ズームアウト時間
* `--nsmhs-opacity` - 透明度
* `--nsmhs-blur` - ブラー効果

= 技術仕様 =

* バニラJavaScript（jQueryフリー）
* CSS Grid Layout
* IntersectionObserver API
* CSS Custom Properties
* WordPress Coding Standards準拠