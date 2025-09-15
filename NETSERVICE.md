# NETSERVICE.md — Netservice/やすお用ローカル規約（v0.3）

目的：自分の案件を**速く・安全に・再現性高く**回すためのローカル基準。

## 命名・スラッグ
- 接頭辞は **`of_`** を基本（関数・フック・オプション・JS変数・CSSクラスに貫徹）
- プラグイン Text Domain＝スラッグ（例：`ns-tab-sync` なら `ns-tab-sync`）

## 既定ヘッダー（初期値）
/**

Plugin Name: [プラグイン名]
Description: [説明]
Version: 0.01
Author: Netservice
Author URI: https://netservice.jp/
License: GPLv2 or later
Text Domain: [ファイル名から自動取得]
*/

markdown
コードをコピーする
- 初回は **0.01**、以降 **0.01 刻み**で上げる（履歴の見通し優先）

## メール・通知
- 管理者宛の既定：**fujiwara@netservice.jp**  
- `wp_mail()` 利用。マルチバイト対策を意識（件名・本文エンコーディング）

## フォルダ構成（最小）
plugin/
plugin.php
includes/
assets/
languages/
readme.txt

markdown
コードをコピーする

## 実装ポリシー（WPと組み合わせ）
- DB直叩きは **prepare + キャッシュ**（`wp_cache_*` or Transients）
- フロント/管理の enqueue は**対象画面だけ**  
- 文字列は**必ず翻訳**（`__()` / `esc_html__()` など）
- **独自アップデータ禁止**・更新ルーチン改変禁止

## Git/SVN 運用
- コミットは **短文・1コミット1意図・日本語**（例：「fix: 翻訳関数を適用」）
- リリース時に Version と readme を同期
- 細切れの “update” 連投は避ける（まとめて論理単位で）

## チェックリスト（出荷前）
- [ ] 入力 sanitize / 出力 escape / nonce + 権限  
- [ ] `$wpdb->prepare()` ＋ キャッシュ  
- [ ] enqueue 範囲最小化  
- [ ] i18n 完了・Text Domain一致  
- [ ] readme とヘッダー整合  
- [ ] Plugin Directory規約に抵触なし  
- [ ] PHPCS(WPCS) / Plugin Check 実行  
- Done基準：**エラーなし、警告は理由付けの上で最小限**