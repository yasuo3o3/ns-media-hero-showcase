<?php

defined('ABSPATH') || exit;

class NSMHS_Block {

    private static $instance = null;
    private $render;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->render = NSMHS_Render::get_instance();
        add_action('init', [$this, 'register_block']);
    }

    public function register_block() {
        if (!function_exists('register_block_type')) {
            return;
        }

        register_block_type('nsmhs/hero-showcase', [
            'editor_script' => 'nsmhs-block-editor',
            'render_callback' => [$this, 'render_block'],
            'attributes' => [
                'id' => [
                    'type' => 'string',
                    'default' => 'default'
                ],
                'fullViewport' => [
                    'type' => 'boolean',
                    'default' => false
                ],
                'logoPosition' => [
                    'type' => 'string',
                    'enum' => ['aboveTitle', 'belowCTA'],
                    'default' => 'aboveTitle'
                ],
                'contentScale' => [
                    'type' => 'number',
                    'default' => 100
                ],
                'scaleDesktopOnly' => [
                    'type' => 'boolean',
                    'default' => false
                ]
            ]
        ]);

        // Enqueue block editor assets
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_block_editor_assets']);
    }

    public function render_block($attributes, $content) {
        return $this->render->render_showcase($attributes);
    }

    public function enqueue_block_editor_assets() {
        wp_enqueue_script(
            'nsmhs-block-editor',
            NSMHS_PLUGIN_URL . 'admin/assets/block-editor.js',
            ['wp-blocks', 'wp-element', 'wp-editor', 'wp-components'],
            NSMHS_VERSION,
            true
        );

        wp_localize_script('nsmhs-block-editor', 'nsmhsBlock', [
            'settingsUrl' => admin_url('options-general.php?page=nsmhs-settings'),
            'strings' => [
                'title' => __('NS Media Hero Showcase', 'ns-media-hero-showcase'),
                'description' => __('ヒーロー領域でメディアタイルが順番にズーム表示されるショーケース', 'ns-media-hero-showcase'),
                'settingsLink' => __('設定画面で詳細を設定', 'ns-media-hero-showcase'),
                'preview' => __('プレビュー（実際の表示は設定内容により変わります）', 'ns-media-hero-showcase')
            ]
        ]);

        wp_enqueue_style(
            'nsmhs-block-editor',
            NSMHS_PLUGIN_URL . 'admin/assets/block-editor.css',
            ['wp-edit-blocks'],
            NSMHS_VERSION
        );
    }
}