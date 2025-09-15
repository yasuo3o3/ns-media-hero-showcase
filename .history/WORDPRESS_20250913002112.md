# WORDPRESS.md — WordPress プラグイン開発ガイド（v0.3）

目的：WordPress.org の審査・運用で詰まらない“素直な”プラグインを作る。

## 原則（黄金の8則）
1) セキュリティ：入力 `sanitize_*`、出力 `esc_*`、変更系は **nonce + current_user_can()**  
2) i18n：すべての文字列を `__()` 等で。**Text Domain＝プラグインスラッグ**  
3) DB：`$wpdb->prepare()` 必須＋**キャッシュ**（`wp_cache_*` / Transients）  
4) 構成：エントリ最小、機能は `includes/`、資産は `assets/`、翻訳は `languages/`  
5) 読み込み：CSS/JSは**必要な画面だけ** enqueue  
6) 更新：**独自アップデータ禁止**（更新フック横取りNG）  
7) 命名：接頭辞で衝突回避（例：`of_` などプロジェクト既定に従う）  
8) ライセンス：**すべてGPL互換**（画像・JS・同梱物も含む）

## Plugin Directory 規約で落ちやすい点（要対応）
- 可読コード義務：難読化/名前潰しNG。ミニファイは**元ソース同梱/URL提示**  
- 有料/試用制限NG：プラグイン自体の機能ロック・期限切れは不可（SaaS連携は説明必須）  
- “なんちゃってSaaS”禁止：ライセンス検証だけの外部依存はNG  
- トラッキングは**オプトイン**＋readmeに明記  
- 外部コード配信/外部更新禁止：WordPress.org外からのコード注入/更新は不可  
- フロントの「Powered by」等は**デフォルトOFF**（ユーザーが有効化できる）  
- タグスパム禁止：readmeタグは**5個以内**、競合名や過剰キーワードNG  
- WP同梱ライブラリの利用：jQuery/PHPMailer等は**同梱しない**  
- 商標配慮：スラッグ先頭に「wordpress」や他社商標を置かない  
- 提出は**完成物のみ**。スラッグ取り置き不可

## readme.txt / ヘッダー
- `Plugin Name / Description / Version / License / Text Domain / Requires at least / Requires PHP` を整合
- `Stable tag` は `Version` と一致させる（配布運用に合わせて）

## チェック手順（推奨フロー）
1) `php -l` / 単体実行テスト  
2) PHPCS（WPCS: `WordPress`, `WordPress-Extra`）  
3) Plugin Check  
4) 目視確認：i18n、権限、キャッシュ、外部通信のオプトイン、readme掲載内容

## Done条件（WP）
- **合格ライン：エラーなし／警告は理由付きで最小限**  
- Directory規約違反がない（上記リスト参照）



## プラグインチェック作業中によく出てきた注意点。
### 出力エスケープの原則（Plugin Check対策）

- **基本ルール**
  - HTML属性 → `esc_attr()`
  - テキスト → `esc_html()`
  - URL → `esc_url()`
  - HTML断片（信頼済みHTML） → `wp_kses_post()` か `wp_kses()`
  - 翻訳出力は `esc_html__()` / `esc_attr__()` で文脈に応じてエスケープ

- **注意すべきケース**
  - `__()` や `_n()` など翻訳関数を直接 `echo` しない
  - `printf()` / `sprintf()` の引数も必ずエスケープ
  - メソッドの戻り値や外部HTMLも直接 `echo` せず `wp_kses_post()` を挟む
  - `selected()`, `checked()`, `disabled()` などWPコア関数は安全なのでOK

- **Plugin Checkでよく出るエラー**
  - `WordPress.Security.EscapeOutput.OutputNotEscaped`
    → 上記の対応で解消


### 不要なヘッダ削除ルール
- `Network:` ヘッダは `true` 以外不要。`false` はエラーになるため削除する。
- `Tested up to:` は WordPress 最新版に合わせて更新。古いままだと検索に出ない。


### 翻訳ロードの新方針
- `load_plugin_textdomain()` は不要（WP4.6+で自動ロード）。
- `languages/` ディレクトリとスラッグ命名が正しければ翻訳は自動反映。


### Plugin Check 対策の明文化
- Plugin Check は毎回リリース前に通すこと。
- エラーは必ず解消、警告は理由をコメントに明記。

### エスケープの早見表（簡易版）
- 属性 → esc_attr()
- テキスト → esc_html()
- URL → esc_url()
- HTML断片 → wp_kses_post()
- 翻訳 → esc_html__() / esc_attr__()
- WPコア関数（selected()等）は安全


## readme.txt管理のルール
- Stable tag と Version の一致を毎回確認
- Requires at least と Requires PHP も最新版に合わせる

## Plugin Checkのワークフロー明文化
- php -l → PHPCS → Plugin Check → 手動レビュー
- 審査通過に必要な「検索に出る条件」も簡単に書くと良い

## セキュリティ標準の一言メモ
- 「出力はesc_、入力はsanitize_、変更操作はnonce+権限チェック」→ ゴールデンルールを見出しで強調

