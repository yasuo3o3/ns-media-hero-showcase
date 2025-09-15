<?php
/**
 * Plugin Name: NS Media Hero Showcase
 * Description: ヒーロー領域で画像/動画タイルが順番にズーム→全画面→戻るを繰り返すショーケース機能
 * Version: 0.01
 * Author: Netservice
 * Author URI: https://netservice.jp/
 * License: GPLv2 or later
 * Text Domain: ns-media-hero-showcase
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

defined('ABSPATH') || exit;

define('NSMHS_PLUGIN_FILE', __FILE__);
define('NSMHS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('NSMHS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('NSMHS_VERSION', '0.01');

class NSMediaHeroShowcase {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('plugins_loaded', [$this, 'init']);
        register_activation_hook(__FILE__, [$this, 'on_activation']);
        register_deactivation_hook(__FILE__, [$this, 'on_deactivation']);
    }

    public function init() {
        // Load text domain
        load_plugin_textdomain('ns-media-hero-showcase', false, dirname(plugin_basename(__FILE__)) . '/languages');

        // Include required files
        $this->include_files();

        // Initialize components
        $this->init_components();

        // Load assets
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }

    private function include_files() {
        require_once NSMHS_PLUGIN_DIR . 'includes/Config.php';
        require_once NSMHS_PLUGIN_DIR . 'includes/Render.php';
        require_once NSMHS_PLUGIN_DIR . 'includes/Block.php';
        require_once NSMHS_PLUGIN_DIR . 'includes/Shortcode.php';
        require_once NSMHS_PLUGIN_DIR . 'admin/SettingsPage.php';
    }

    private function init_components() {
        // Initialize configuration
        NSMHS_Config::get_instance();

        // Initialize admin settings page
        if (is_admin()) {
            NSMHS_SettingsPage::get_instance();
        }

        // Initialize block and shortcode
        NSMHS_Block::get_instance();
        NSMHS_Shortcode::get_instance();
    }

    public function enqueue_frontend_assets() {
        wp_enqueue_style(
            'nsmhs-frontend',
            NSMHS_PLUGIN_URL . 'assets/css/frontend.css',
            [],
            NSMHS_VERSION
        );

        wp_enqueue_script(
            'nsmhs-frontend',
            NSMHS_PLUGIN_URL . 'assets/js/frontend.js',
            [],
            NSMHS_VERSION,
            true
        );
    }

    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'nsmhs-settings') === false) {
            return;
        }

        // Enqueue media scripts for media library picker
        wp_enqueue_media();

        wp_enqueue_style(
            'nsmhs-admin',
            NSMHS_PLUGIN_URL . 'admin/assets/admin.css',
            [],
            NSMHS_VERSION
        );

        wp_enqueue_script(
            'nsmhs-admin',
            NSMHS_PLUGIN_URL . 'admin/assets/admin.js',
            ['jquery', 'media-upload', 'media-views'],
            NSMHS_VERSION,
            true
        );

        wp_localize_script('nsmhs-admin', 'nsmhs_admin', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('nsmhs_admin_nonce'),
            'strings' => [
                'save_success' => __('設定を保存しました', 'ns-media-hero-showcase'),
                'save_error' => __('設定の保存に失敗しました', 'ns-media-hero-showcase'),
                'delete_confirm' => __('このメディアを削除しますか？', 'ns-media-hero-showcase'),
            ]
        ]);
    }

    public function on_activation() {
        // Set default options
        $default_config = [
            'media' => [],
            'grids' => [
                'pc' => '5x3',
                'tablet' => '4x2',
                'phone' => '3x2'
            ],
            'order' => 'ltr',
            'timing' => [
                'displayDuration' => 3000,
                'zoomInDuration' => 900,
                'zoomOutDuration' => 700,
                'easing' => 'ease-in-out'
            ],
            'effects' => [
                'opacity' => 1,
                'blurPx' => 6
            ],
            'layers' => [
                'mid' => [
                    'enabled' => true,
                    'shadowStrength' => 0.25,
                    'overlayVideoSrc' => ''
                ],
                'top' => [
                    'title' => '',
                    'subtitle' => '',
                    'ctaText' => '',
                    'ctaUrl' => '',
                    'logoSrc' => '',
                    'logoAlt' => ''
                ]
            ]
        ];

        if (!get_option('nsmhs_settings')) {
            update_option('nsmhs_settings', $default_config);
        }
    }

    public function on_deactivation() {
        // Clean up if needed
    }
}

NSMediaHeroShowcase::get_instance();