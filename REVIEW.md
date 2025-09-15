# REVIEW.md — WordPress 本番前レビュー依頼プロンプト

**【目的】**

この WordPress プラグインを、本番運用前に **WPCS準拠 / セキュリティ / 運用性** の観点でレビューし、**具体的な修正差分（最小）**まで提示してください。

**【レビュー範囲】**

1. 規約：WordPress Coding Standards（PHPCSの**規則名**付きで指摘）
2. セキュリティ：権限（`current_user_can`）/ CSRF（nonce）/ XSS（`esc_*`/`wp_kses`）/ SQLi（`$wpdb->prepare`）/ ファイル操作 / REST（`permission_callback`必須）/ SSRF / **オプションの `autoload`**
3. パフォーマンス：**必要画面だけ**への CSS/JS エンキュー、DB/トランジェント、重処理の分離（非同期/遅延）
4. 運用：activate/update/uninstall、スキーマのバージョニング、ロールバック手順の想定
5. i18n/ライセンス/プライバシー（`Text Domain`、翻訳関数、readme.txt の `Requires at least`/`Tested up to` など）

**【出力フォーマット】**

- ①**重大度**：Blocker / Critical / Major / Minor
- ②**根拠**：該当する規約名や一般的ベストプラクティス
- ③**短い理由**（1〜3行）
- ④**最小差分の修正例**（関数/フック名を示し、置換前後 or パッチ風の最小修正）
- ⑤**再発防止**（チェックリストや自動テストの案）

**【合格基準（Definition of Done）】**

- Blocker/Critical が **0**
- WPCS **エラー 0**（警告は“許容理由”を併記）
- 非管理者による権限逸脱が **不可能**
- 主要フローで **致命的エラーなし**
- `uninstall.php` で **意図どおりに後始末**（残すデータは明記）

**【最後に必ず】**

- 「**短期で直すTop5**」と「**後回し可リスト**」を分けて提示
- 各項目の **概算工数（ざっくり時間）**
- **将来のリファクタ指針**（2〜3行で方向性）

**【補足ルール（この会話の方針）】**

- 雑談レベルなら軽めでOK。
- **仕様・プロンプト設計フェーズでは弱点を早めに提示**。
- 実装終盤は最終確認中心で、重い企画替えは避ける。

---

## そのまま使えるチェック短冊（レビュワー用）

- [ ]  権限：全操作で `current_user_can()`
- [ ]  CSRF：フォーム/AJAX/REST の全経路で nonce 検証
- [ ]  XSS：出力は `esc_html`/`esc_attr`/`esc_url`/`wp_kses`
- [ ]  SQLi：**必ず** `$wpdb->prepare()`、テーブルは `$wpdb->prefix` 起点
- [ ]  REST：`permission_callback`、入力 sanitize / 出力 escape
- [ ]  autoload：重い/可変データを autoload に入れない
- [ ]  エンキュー：対象画面だけに読み込み、ver付与でキャッシュ制御
- [ ]  uninstall：オプション/テーブル/cron/権限の後始末
- [ ]  i18n：Text Domain / `__()` 系の適正化、readme.txt 記述

---

### 既定値の意図（ざっくり）

- **WP 6.8**：ブロック前提の運用に十分/広く互換、かつ“最新限定”を強制しないバランス。
- **PHP 8.1**：7系はもう推奨しづらい。8.0以上なら型関連の落とし穴も減り、将来対応も楽。
- **Administratorのみ**：運用初期は権限面の事故を避けるための保守設定。
- **PIIなし**：まず“個人情報を持たない”が基本。必要になればその時点で明文化して上書き。

---

## 追加チェック（命名・衝突回避）
- 4文字以上の固有プレフィックス必須（例：`selerelo_` / `SELERELO_` / `Selerelo_*`）。
- 対象：関数・クラス・定数・グローバル・フック名・オプション名の文字列タグ。
- 禁止：`srl` 等の3文字、`wp_` / `_` / `__`。
- grepで残存ゼロ確認：`grep -R "\bsrl_" -n .` 等。

## 追加チェック（配布パッケージ）
- ZIPに`assets/`を同梱しない。SVNの`/assets`で管理。
- `tags/` `branches/`をZIPに含めない。
- `.gitattributes`で`export-ignore`設定。

## 追加チェック（require/include整合）
- ファイル名と`require_once`参照を完全一致（大文字小文字含む）。
- `grep -R "require_once" -n`で確認。

## readme / メタ情報
- ContributorsはWP.orgユーザー名のみ。表示避けたければ空可。
- ヘッダ整合：Requires/Tested/Requires PHP/License/Stable tag。
- Text Domain＝スラッグ。翻訳はlanguages/内に。

## レビューチェック短冊追加
- [ ] プレフィックス：4文字以上で統一、旧`srl`残存ゼロ
- [ ] フック/オプション名：文字列タグも新接頭辞
- [ ] 配布ZIP：`assets/`・`tags/`・`branches/` 非同梱
- [ ] require/include：ファイル名と一致
- [ ] readme整合：Contributors/Requires/Tested/License/Stable tag
