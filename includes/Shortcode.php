<?php

defined('ABSPATH') || exit;

class NSMHS_Shortcode {

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
        add_action('init', [$this, 'register_shortcode']);
    }

    public function register_shortcode() {
        add_shortcode('ns_media_hero_showcase', [$this, 'render_shortcode']);
    }

    public function render_shortcode($atts) {
        $atts = shortcode_atts([
            'id' => 'default'
        ], $atts, 'ns_media_hero_showcase');

        return $this->render->render_showcase($atts);
    }
}