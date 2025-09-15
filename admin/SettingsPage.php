<?php

defined('ABSPATH') || exit;

class NSMHS_SettingsPage {

    private static $instance = null;
    private $config;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->config = NSMHS_Config::get_instance();
        add_action('admin_menu', [$this, 'add_admin_menu']);
    }

    public function add_admin_menu() {
        add_options_page(
            __('NS Media Hero Showcase 設定', 'ns-media-hero-showcase'),
            __('Media Hero Showcase', 'ns-media-hero-showcase'),
            'manage_options',
            'nsmhs-settings',
            [$this, 'render_admin_page']
        );
    }

    public function render_admin_page() {
        $settings = $this->config->get_settings();
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(__('NS Media Hero Showcase 設定', 'ns-media-hero-showcase')); ?></h1>

            <div id="nsmhs-admin-app">
                <form id="nsmhs-settings-form">
                    <?php wp_nonce_field('nsmhs_admin_nonce', 'nsmhs_nonce'); ?>

                    <!-- Media Section -->
                    <div class="nsmhs-section">
                        <h2><?php echo esc_html(__('メディア設定', 'ns-media-hero-showcase')); ?></h2>

                        <div class="nsmhs-media-list" id="nsmhs-media-list">
                            <!-- Media items will be populated by JavaScript -->
                        </div>

                        <button type="button" id="nsmhs-add-media" class="button">
                            <?php echo esc_html(__('メディアを追加', 'ns-media-hero-showcase')); ?>
                        </button>
                    </div>

                    <!-- Grid Settings -->
                    <div class="nsmhs-section">
                        <h2><?php echo esc_html(__('グリッド設定', 'ns-media-hero-showcase')); ?></h2>

                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php echo esc_html(__('PC', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <select name="grids[pc]" id="grid-pc">
                                        <option value="3x2" <?php selected($settings['grids']['pc'], '3x2'); ?>>3x2 (6)</option>
                                        <option value="3x3" <?php selected($settings['grids']['pc'], '3x3'); ?>>3x3 (9)</option>
                                        <option value="3x4" <?php selected($settings['grids']['pc'], '3x4'); ?>>3x4 (12)</option>
                                        <option value="3x5" <?php selected($settings['grids']['pc'], '3x5'); ?>>3x5 (15)</option>
                                        <option value="4x2" <?php selected($settings['grids']['pc'], '4x2'); ?>>4x2 (8)</option>
                                        <option value="4x3" <?php selected($settings['grids']['pc'], '4x3'); ?>>4x3 (12)</option>
                                        <option value="4x5" <?php selected($settings['grids']['pc'], '4x5'); ?>>4x5 (20)</option>
                                        <option value="5x3" <?php selected($settings['grids']['pc'], '5x3'); ?>>5x3 (15)</option>
                                        <option value="5x4" <?php selected($settings['grids']['pc'], '5x4'); ?>>5x4 (20)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('タブレット', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <select name="grids[tablet]" id="grid-tablet">
                                        <option value="3x2" <?php selected($settings['grids']['tablet'], '3x2'); ?>>3x2 (6)</option>
                                        <option value="3x3" <?php selected($settings['grids']['tablet'], '3x3'); ?>>3x3 (9)</option>
                                        <option value="3x4" <?php selected($settings['grids']['tablet'], '3x4'); ?>>3x4 (12)</option>
                                        <option value="3x5" <?php selected($settings['grids']['tablet'], '3x5'); ?>>3x5 (15)</option>
                                        <option value="4x2" <?php selected($settings['grids']['tablet'], '4x2'); ?>>4x2 (8)</option>
                                        <option value="4x3" <?php selected($settings['grids']['tablet'], '4x3'); ?>>4x3 (12)</option>
                                        <option value="4x5" <?php selected($settings['grids']['tablet'], '4x5'); ?>>4x5 (20)</option>
                                        <option value="5x3" <?php selected($settings['grids']['tablet'], '5x3'); ?>>5x3 (15)</option>
                                        <option value="5x4" <?php selected($settings['grids']['tablet'], '5x4'); ?>>5x4 (20)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('スマホ', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <select name="grids[phone]" id="grid-phone">
                                        <option value="3x2" <?php selected($settings['grids']['phone'], '3x2'); ?>>3x2 (6)</option>
                                        <option value="3x3" <?php selected($settings['grids']['phone'], '3x3'); ?>>3x3 (9)</option>
                                        <option value="3x4" <?php selected($settings['grids']['phone'], '3x4'); ?>>3x4 (12)</option>
                                        <option value="3x5" <?php selected($settings['grids']['phone'], '3x5'); ?>>3x5 (15)</option>
                                        <option value="4x2" <?php selected($settings['grids']['phone'], '4x2'); ?>>4x2 (8)</option>
                                        <option value="4x3" <?php selected($settings['grids']['phone'], '4x3'); ?>>4x3 (12)</option>
                                        <option value="4x5" <?php selected($settings['grids']['phone'], '4x5'); ?>>4x5 (20)</option>
                                        <option value="5x3" <?php selected($settings['grids']['phone'], '5x3'); ?>>5x3 (15)</option>
                                        <option value="5x4" <?php selected($settings['grids']['phone'], '5x4'); ?>>5x4 (20)</option>
                                    </select>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Animation Settings -->
                    <div class="nsmhs-section">
                        <h2><?php echo esc_html(__('アニメーション設定', 'ns-media-hero-showcase')); ?></h2>

                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php echo esc_html(__('順序', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <label>
                                        <input type="radio" name="order" value="ltr" <?php checked($settings['order'], 'ltr'); ?>>
                                        <?php echo esc_html(__('左上→右下', 'ns-media-hero-showcase')); ?>
                                    </label><br>
                                    <label>
                                        <input type="radio" name="order" value="rtl" <?php checked($settings['order'], 'rtl'); ?>>
                                        <?php echo esc_html(__('右上→左下', 'ns-media-hero-showcase')); ?>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('表示時間(ms)', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="number" name="timing[displayDuration]" value="<?php echo esc_attr($settings['timing']['displayDuration']); ?>" min="1000" max="10000" step="100">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('ズームイン時間(ms)', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="number" name="timing[zoomInDuration]" value="<?php echo esc_attr($settings['timing']['zoomInDuration']); ?>" min="300" max="3000" step="100">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('ズームアウト時間(ms)', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="number" name="timing[zoomOutDuration]" value="<?php echo esc_attr($settings['timing']['zoomOutDuration']); ?>" min="300" max="3000" step="100">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('透明度', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="range" name="effects[opacity]" value="<?php echo esc_attr($settings['effects']['opacity']); ?>" min="0" max="1" step="0.1">
                                    <span class="nsmhs-range-value"><?php echo esc_html($settings['effects']['opacity']); ?></span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('ブラー(px)', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="range" name="effects[blurPx]" value="<?php echo esc_attr($settings['effects']['blurPx']); ?>" min="0" max="20" step="1">
                                    <span class="nsmhs-range-value"><?php echo esc_html($settings['effects']['blurPx']); ?></span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Layer Settings -->
                    <div class="nsmhs-section">
                        <h2><?php echo esc_html(__('レイヤー設定', 'ns-media-hero-showcase')); ?></h2>

                        <h3><?php echo esc_html(__('パターン', 'ns-media-hero-showcase')); ?></h3>
                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php echo esc_html(__('有効', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <label>
                                        <input type="checkbox" name="layers[mid][enabled]" value="1" <?php checked($settings['layers']['mid']['enabled']); ?>>
                                        <?php echo esc_html(__('中間レイヤーを有効にする', 'ns-media-hero-showcase')); ?>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('パターン', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <select name="layers[mid][middlePattern]">
                                        <option value="none" <?php selected($settings['layers']['mid']['middlePattern'], 'none'); ?>>なし</option>
                                        <option value="animated-gradient" <?php selected($settings['layers']['mid']['middlePattern'], 'animated-gradient'); ?>>動くグラデーション</option>
                                        <option value="dots" <?php selected($settings['layers']['mid']['middlePattern'], 'dots'); ?>>ドット</option>
                                        <option value="tiles" <?php selected($settings['layers']['mid']['middlePattern'], 'tiles'); ?>>タイル</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('影の強さ', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="range" name="layers[mid][shadowStrength]" value="<?php echo esc_attr($settings['layers']['mid']['shadowStrength']); ?>" min="0" max="1" step="0.05">
                                    <span class="nsmhs-range-value"><?php echo esc_html($settings['layers']['mid']['shadowStrength']); ?></span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('オーバーレイ種類', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <select name="layers[mid][overlay][type]">
                                        <option value="none" <?php selected($settings['layers']['mid']['overlay']['type'], 'none'); ?>>なし</option>
                                        <option value="constellation" <?php selected($settings['layers']['mid']['overlay']['type'], 'constellation'); ?>>コンステレーション</option>
                                        <option value="morph-polygons" <?php selected($settings['layers']['mid']['overlay']['type'], 'morph-polygons'); ?>>モーフポリゴン</option>
                                        <option value="soft-waves" <?php selected($settings['layers']['mid']['overlay']['type'], 'soft-waves'); ?>>ソフトウェーブ</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('オーバーレイ透明度', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="range" name="layers[mid][overlay][opacity]" value="<?php echo esc_attr($settings['layers']['mid']['overlay']['opacity']); ?>" min="0" max="1" step="0.05">
                                    <span class="nsmhs-range-value"><?php echo esc_html($settings['layers']['mid']['overlay']['opacity']); ?></span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('アニメーション速度', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="range" name="layers[mid][overlay][speed]" value="<?php echo esc_attr($settings['layers']['mid']['overlay']['speed']); ?>" min="0.25" max="2" step="0.25">
                                    <span class="nsmhs-range-value"><?php echo esc_html($settings['layers']['mid']['overlay']['speed']); ?></span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('密度', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <select name="layers[mid][overlay][density]">
                                        <option value="low" <?php selected($settings['layers']['mid']['overlay']['density'], 'low'); ?>>低</option>
                                        <option value="medium" <?php selected($settings['layers']['mid']['overlay']['density'], 'medium'); ?>>中</option>
                                        <option value="high" <?php selected($settings['layers']['mid']['overlay']['density'], 'high'); ?>>高</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('ブレンドモード', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <select name="layers[mid][overlay][blendMode]">
                                        <option value="normal" <?php selected($settings['layers']['mid']['overlay']['blendMode'], 'normal'); ?>>通常</option>
                                        <option value="screen" <?php selected($settings['layers']['mid']['overlay']['blendMode'], 'screen'); ?>>スクリーン</option>
                                        <option value="overlay" <?php selected($settings['layers']['mid']['overlay']['blendMode'], 'overlay'); ?>>オーバーレイ</option>
                                        <option value="multiply" <?php selected($settings['layers']['mid']['overlay']['blendMode'], 'multiply'); ?>>乗算</option>
                                    </select>
                                </td>
                            </tr>
                        </table>

                        <h3><?php echo esc_html(__('UI要素', 'ns-media-hero-showcase')); ?></h3>
                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php echo esc_html(__('タイトル', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="text" name="layers[top][title]" value="<?php echo esc_attr($settings['layers']['top']['title']); ?>" class="regular-text">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('サブタイトル', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="text" name="layers[top][subtitle]" value="<?php echo esc_attr($settings['layers']['top']['subtitle']); ?>" class="regular-text">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('CTAテキスト', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="text" name="layers[top][ctaText]" value="<?php echo esc_attr($settings['layers']['top']['ctaText']); ?>" class="regular-text">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('CTAURL', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="url" name="layers[top][ctaUrl]" value="<?php echo esc_attr($settings['layers']['top']['ctaUrl']); ?>" class="regular-text">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('ロゴ', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <!-- Hidden fields for data storage -->
                                    <input type="hidden" name="layers[top][logoId]" id="logo-id" value="<?php echo esc_attr($settings['layers']['top']['logoId'] ?? 0); ?>">
                                    <input type="url" name="layers[top][logoSrc]" id="logo-src" value="<?php echo esc_attr($settings['layers']['top']['logoSrc']); ?>" class="regular-text" readonly placeholder="ロゴが選択されていません">

                                    <!-- Logo selection buttons -->
                                    <div class="nsmhs-logo-controls" style="margin-top: 5px;">
                                        <button type="button" id="select-logo" class="button" aria-label="ロゴを選択">
                                            ロゴを選択
                                        </button>
                                        <button type="button" id="clear-logo" class="button" aria-label="クリア" style="<?php echo empty($settings['layers']['top']['logoSrc']) ? 'display: none;' : ''; ?>">
                                            クリア
                                        </button>

                                        <!-- Logo preview -->
                                        <div id="logo-preview" style="display: inline-block; margin-left: 10px; vertical-align: middle; <?php echo empty($settings['layers']['top']['logoSrc']) ? 'display: none;' : ''; ?>">
                                            <img src="<?php echo esc_url($settings['layers']['top']['logoSrc']); ?>" alt="" style="max-width: 32px; max-height: 32px; border: 1px solid #ddd;">
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('ロゴALT', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="text" name="layers[top][logoAlt]" id="logo-alt" value="<?php echo esc_attr($settings['layers']['top']['logoAlt']); ?>" class="regular-text" placeholder="ロゴの代替テキスト">
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Layer Debug Controls -->
                    <div class="nsmhs-section">
                        <h2><?php echo esc_html(__('レイヤーデバッグ', 'ns-media-hero-showcase')); ?></h2>
                        <p class="description"><?php echo esc_html(__('各レイヤーの表示/非表示を切り替えてデバッグできます。変更は即座に反映されます。', 'ns-media-hero-showcase')); ?></p>

                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php echo esc_html(__('表示レイヤー', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <fieldset>
                                        <legend class="screen-reader-text"><span><?php echo esc_html(__('表示レイヤー', 'ns-media-hero-showcase')); ?></span></legend>
                                        <label>
                                            <input type="checkbox" id="layer-tiles" checked>
                                            <?php echo esc_html(__('タイル', 'ns-media-hero-showcase')); ?>
                                            <span class="description">(Z-index: 1)</span>
                                        </label><br>
                                        <label>
                                            <input type="checkbox" id="layer-zoom" checked>
                                            <?php echo esc_html(__('ズーム', 'ns-media-hero-showcase')); ?>
                                            <span class="description">(Z-index: 5)</span>
                                        </label><br>
                                        <label>
                                            <input type="checkbox" id="layer-pattern" checked>
                                            <?php echo esc_html(__('パターン', 'ns-media-hero-showcase')); ?>
                                            <span class="description">(Z-index: 8)</span>
                                        </label><br>
                                        <label>
                                            <input type="checkbox" id="layer-overlay" checked>
                                            <?php echo esc_html(__('オーバーレイ', 'ns-media-hero-showcase')); ?>
                                            <span class="description">(Z-index: 10)</span>
                                        </label><br>
                                        <label>
                                            <input type="checkbox" id="layer-ui" checked>
                                            <?php echo esc_html(__('UI要素', 'ns-media-hero-showcase')); ?>
                                            <span class="description">(Z-index: 20)</span>
                                        </label>
                                    </fieldset>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <p class="submit">
                        <input type="submit" name="submit" id="submit" class="button-primary" value="<?php echo esc_attr(__('設定を保存', 'ns-media-hero-showcase')); ?>">
                    </p>
                </form>
            </div>

            <!-- Media Item Template -->
            <script type="text/template" id="nsmhs-media-template">
                <div class="nsmhs-media-item" data-index="{{index}}">
                    <div class="nsmhs-media-header">
                        <span class="nsmhs-media-drag">⋮⋮</span>
                        <span class="nsmhs-media-type-display">画像</span>
                        <button type="button" class="nsmhs-media-remove button-link-delete">削除</button>
                    </div>
                    <div class="nsmhs-media-fields">
                        <!-- Hidden fields for data storage -->
                        <input type="hidden" name="media[{{index}}][type]" class="nsmhs-media-type" value="image">
                        <input type="hidden" name="media[{{index}}][src]" class="nsmhs-media-src" value="">
                        <input type="hidden" name="media[{{index}}][mime]" class="nsmhs-media-mime" value="">
                        <input type="hidden" name="media[{{index}}][poster]" class="nsmhs-media-poster" value="">

                        <!-- Media selection UI -->
                        <div class="nsmhs-media-selection">
                            <button type="button" class="button nsmhs-select-media" aria-label="メディアを選択">
                                メディアを選択
                            </button>
                            <button type="button" class="button nsmhs-clear-media" aria-label="クリア" style="display: none;">
                                クリア
                            </button>
                        </div>

                        <!-- Media preview -->
                        <div class="nsmhs-media-preview" style="display: none;">
                            <div class="nsmhs-preview-image" style="display: none;">
                                <img src="" alt="" style="max-width: 150px; max-height: 100px;">
                            </div>
                            <div class="nsmhs-preview-video" style="display: none;">
                                <span class="nsmhs-video-placeholder">🎬 動画ファイル: <span class="nsmhs-video-extension"></span></span>
                            </div>
                        </div>

                        <!-- Poster selection for videos -->
                        <div class="nsmhs-poster-section" style="display: none;">
                            <label>ポスター画像（任意）:</label>
                            <div class="nsmhs-poster-selection">
                                <button type="button" class="button nsmhs-select-poster" aria-label="ポスターを選択">
                                    ポスターを選択
                                </button>
                                <button type="button" class="button nsmhs-clear-poster" aria-label="ポスターをクリア" style="display: none;">
                                    クリア
                                </button>
                            </div>
                            <div class="nsmhs-poster-preview" style="display: none;">
                                <img src="" alt="" style="max-width: 150px; max-height: 100px;">
                            </div>
                        </div>
                    </div>
                </div>
            </script>
        </div>

        <script>
        // Initialize settings data for JavaScript
        window.nsmhsSettings = <?php echo wp_json_encode($settings); ?>;

        // Layer Debug Controls
        (function() {
            const storageKey = 'nsmhs_layer_debug';

            // Load saved settings
            function loadLayerSettings() {
                try {
                    const saved = localStorage.getItem(storageKey);
                    return saved ? JSON.parse(saved) : {tiles: 1, zoom: 1, pattern: 1, overlay: 1, ui: 1};
                } catch (e) {
                    return {tiles: 1, zoom: 1, pattern: 1, overlay: 1, ui: 1};
                }
            }

            // Save settings
            function saveLayerSettings(settings) {
                try {
                    localStorage.setItem(storageKey, JSON.stringify(settings));
                } catch (e) {
                    console.warn('Could not save layer debug settings');
                }
            }

            // Apply settings to all hero instances
            function applyLayerSettings(settings) {
                const heroes = document.querySelectorAll('.ns-hero, .nsmhs-hero-showcase');

                if (heroes.length === 0) {
                    console.log('NSMHS Layer Debug: No hero elements found (expected in admin)');
                    return;
                }

                heroes.forEach(hero => {
                    // Always set data attributes for CSS control
                    hero.setAttribute('data-layer-tiles', String(settings.tiles || 1));
                    hero.setAttribute('data-layer-zoom', String(settings.zoom || 1));
                    hero.setAttribute('data-layer-pattern', String(settings.pattern || 1));
                    hero.setAttribute('data-layer-overlay', String(settings.overlay || 1));
                    hero.setAttribute('data-layer-ui', String(settings.ui || 1));

                    // If JS instance exists, also call the method
                    if (hero.nsmhsInstance && hero.nsmhsInstance.setLayerFlags) {
                        hero.nsmhsInstance.setLayerFlags(settings);
                    } else {
                        console.log('NSMHS Layer Debug: JS instance not found, using CSS-only control');
                    }
                });
            }

            // Initialize on DOM ready
            document.addEventListener('DOMContentLoaded', function() {
                const checkboxes = {
                    tiles: document.getElementById('layer-tiles'),
                    zoom: document.getElementById('layer-zoom'),
                    pattern: document.getElementById('layer-pattern'),
                    overlay: document.getElementById('layer-overlay'),
                    ui: document.getElementById('layer-ui')
                };

                // Load and apply saved settings
                const savedSettings = loadLayerSettings();
                Object.keys(checkboxes).forEach(key => {
                    if (checkboxes[key]) {
                        checkboxes[key].checked = savedSettings[key] === 1;
                    }
                });

                // Apply initial settings (with delay to ensure heroes are initialized)
                // Try multiple times with increasing delays
                setTimeout(() => applyLayerSettings(savedSettings), 500);
                setTimeout(() => applyLayerSettings(savedSettings), 1500);
                setTimeout(() => applyLayerSettings(savedSettings), 3000);

                // Add change listeners
                Object.keys(checkboxes).forEach(key => {
                    if (checkboxes[key]) {
                        checkboxes[key].addEventListener('change', function() {
                            const currentSettings = {};
                            Object.keys(checkboxes).forEach(k => {
                                currentSettings[k] = checkboxes[k] && checkboxes[k].checked ? 1 : 0;
                            });

                            console.log('NSMHS Layer Debug: Checkbox changed', key, 'New settings:', currentSettings);

                            saveLayerSettings(currentSettings);
                            applyLayerSettings(currentSettings);
                        });
                    }
                });
            });

            // Debug functions for troubleshooting
            window.debugLayerControls = function() {
                console.group('=== Layer Debug Controls Diagnosis ===');

                // 1. Hero要素の存在確認
                const heroes = document.querySelectorAll('.ns-hero, .nsmhs-hero-showcase');
                console.log(`Found ${heroes.length} hero elements:`, heroes);

                if (heroes.length === 0) {
                    console.log('ℹ️ No hero elements found in admin page (expected)');
                    console.log('💡 To test layer controls: Go to frontend page with hero elements');
                    console.log('Expected elements: .ns-hero or .nsmhs-hero-showcase');
                    console.groupEnd();
                    return;
                }

                // 2. 各Hero要素の詳細確認
                heroes.forEach((hero, index) => {
                    console.group(`Hero ${index + 1}:`);

                    // 基本情報
                    console.log('Element:', hero);
                    console.log('Classes:', hero.className);
                    console.log('ID:', hero.id || 'No ID');

                    // data属性確認
                    const layerAttrs = {
                        tiles: hero.getAttribute('data-layer-tiles'),
                        zoom: hero.getAttribute('data-layer-zoom'),
                        pattern: hero.getAttribute('data-layer-pattern'),
                        overlay: hero.getAttribute('data-layer-overlay'),
                        ui: hero.getAttribute('data-layer-ui')
                    };
                    console.log('Layer attributes:', layerAttrs);

                    // インスタンス確認
                    const hasInstance = !!hero.nsmhsInstance;
                    console.log('Has JS instance:', hasInstance);
                    if (hasInstance) {
                        if (typeof hero.nsmhsInstance.setLayerFlags === 'function') {
                            console.log('✅ setLayerFlags method exists');
                            if (typeof hero.nsmhsInstance.getLayerFlags === 'function') {
                                console.log('Current flags:', hero.nsmhsInstance.getLayerFlags());
                            }
                        } else {
                            console.warn('❌ setLayerFlags method not found');
                        }
                    } else {
                        console.warn('❌ JS instance not initialized');
                    }

                    // 子要素確認
                    const layers = {
                        tiles: hero.querySelector('.nsmhs-tiles-container'),
                        zoom: hero.querySelector('.nsmhs-zoom-container'),
                        pattern: hero.querySelector('.nsmhs-mid-pattern'),
                        overlay: hero.querySelector('.nsmhs-overlay'),
                        ui: hero.querySelector('.nsmhs-top-layer')
                    };
                    console.log('Layer elements found:', Object.keys(layers).filter(k => layers[k]));
                    console.log('Layer elements missing:', Object.keys(layers).filter(k => !layers[k]));

                    console.groupEnd();
                });

                // 3. チェックボックス確認
                console.group('Checkboxes:');
                const checkboxes = {
                    tiles: document.getElementById('layer-tiles'),
                    zoom: document.getElementById('layer-zoom'),
                    pattern: document.getElementById('layer-pattern'),
                    overlay: document.getElementById('layer-overlay'),
                    ui: document.getElementById('layer-ui')
                };

                Object.keys(checkboxes).forEach(key => {
                    const checkbox = checkboxes[key];
                    if (checkbox) {
                        console.log(`${key}: ${checkbox.checked ? 'checked' : 'unchecked'}`);
                    } else {
                        console.warn(`${key}: not found`);
                    }
                });
                console.groupEnd();

                // 4. LocalStorage確認
                console.group('LocalStorage:');
                try {
                    const stored = localStorage.getItem('nsmhs_layer_debug');
                    console.log('Stored data:', stored);
                    if (stored) {
                        console.log('Parsed data:', JSON.parse(stored));
                    }
                } catch (e) {
                    console.warn('LocalStorage error:', e);
                }
                console.groupEnd();

                console.groupEnd();
            };

            window.testLayerToggle = function(layer, value) {
                console.log(`Testing ${layer} = ${value}`);

                const heroes = document.querySelectorAll('.ns-hero, .nsmhs-hero-showcase');
                if (heroes.length === 0) {
                    console.warn('No hero elements found');
                    return;
                }

                heroes.forEach(hero => {
                    hero.setAttribute(`data-layer-${layer}`, String(value));

                    const elementMap = {
                        tiles: '.nsmhs-tiles-container',
                        zoom: '.nsmhs-zoom-container',
                        pattern: '.nsmhs-mid-pattern',
                        overlay: '.nsmhs-overlay',
                        ui: '.nsmhs-top-layer'
                    };

                    const element = hero.querySelector(elementMap[layer]);
                    if (element) {
                        const isVisible = getComputedStyle(element).display !== 'none';
                        console.log(`${layer} layer: ${isVisible ? 'visible' : 'hidden'}`);
                    } else {
                        console.warn(`${layer} element not found`);
                    }
                });
            };

            window.forceApplyLayerSettings = function(settings) {
                console.log('Force applying layer settings:', settings);
                applyLayerSettings(settings || {tiles: 0, zoom: 1, pattern: 1, overlay: 1, ui: 1});
            };

            console.log('=== NSMHS Layer Debug Tools Loaded ===');
            console.log('Available commands:');
            console.log('- debugLayerControls() : Complete diagnosis');
            console.log('- testLayerToggle("tiles", 0) : Test specific layer');
            console.log('- forceApplyLayerSettings({tiles: 0, zoom: 1, pattern: 1, overlay: 1, ui: 1}) : Force apply settings');

        })();
        </script>
        <?php
    }
}