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
                                        <option value="3x4" <?php selected($settings['grids']['pc'], '3x4'); ?>>3x4 (12)</option>
                                        <option value="4x2" <?php selected($settings['grids']['pc'], '4x2'); ?>>4x2 (8)</option>
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
                                        <option value="3x4" <?php selected($settings['grids']['tablet'], '3x4'); ?>>3x4 (12)</option>
                                        <option value="4x2" <?php selected($settings['grids']['tablet'], '4x2'); ?>>4x2 (8)</option>
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
                                        <option value="3x4" <?php selected($settings['grids']['phone'], '3x4'); ?>>3x4 (12)</option>
                                        <option value="4x2" <?php selected($settings['grids']['phone'], '4x2'); ?>>4x2 (8)</option>
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

                        <h3><?php echo esc_html(__('中間レイヤー', 'ns-media-hero-showcase')); ?></h3>
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
                                <th scope="row"><?php echo esc_html(__('影の強さ', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="range" name="layers[mid][shadowStrength]" value="<?php echo esc_attr($settings['layers']['mid']['shadowStrength']); ?>" min="0" max="1" step="0.05">
                                    <span class="nsmhs-range-value"><?php echo esc_html($settings['layers']['mid']['shadowStrength']); ?></span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('オーバーレイ動画URL', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="url" name="layers[mid][overlayVideoSrc]" value="<?php echo esc_attr($settings['layers']['mid']['overlayVideoSrc']); ?>" class="regular-text">
                                </td>
                            </tr>
                        </table>

                        <h3><?php echo esc_html(__('最上レイヤー', 'ns-media-hero-showcase')); ?></h3>
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
                                <th scope="row"><?php echo esc_html(__('ロゴURL', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="url" name="layers[top][logoSrc]" value="<?php echo esc_attr($settings['layers']['top']['logoSrc']); ?>" class="regular-text">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php echo esc_html(__('ロゴALT', 'ns-media-hero-showcase')); ?></th>
                                <td>
                                    <input type="text" name="layers[top][logoAlt]" value="<?php echo esc_attr($settings['layers']['top']['logoAlt']); ?>" class="regular-text">
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
        </script>
        <?php
    }
}