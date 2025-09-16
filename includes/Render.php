<?php

defined('ABSPATH') || exit;

class NSMHS_Render {

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
    }

    public function render_showcase($atts = []) {
        $settings = $this->config->get_settings();
        $full_viewport = isset($atts['fullViewport']) ? $atts['fullViewport'] : false;
        $logo_position = isset($atts['logoPosition']) ? $atts['logoPosition'] : 'aboveTitle';

        if (empty($settings['media'])) {
            return '<div class="nsmhs-placeholder">' .
                   esc_html__('メディアが設定されていません。管理画面で設定してください。', 'ns-media-hero-showcase') .
                   '</div>';
        }

        $id = 'nsmhs-' . uniqid();

        // Generate CSS custom properties
        $css_vars = $this->generate_css_vars($settings);

        ob_start();
        ?>
        <div id="<?php echo esc_attr($id); ?>"
             class="ns-hero<?php echo $full_viewport ? ' is-full-viewport' : ''; ?><?php echo $logo_position === 'belowCTA' ? ' logo-below-cta' : ''; ?>"
             role="region"
             aria-label="<?php echo esc_attr__('Hero showcase', 'ns-media-hero-showcase'); ?>"
             style="<?php echo esc_attr($css_vars); ?>"
             data-layer-tiles="1"
             data-layer-zoom="1"
             data-layer-pattern="1"
             data-layer-overlay="1"
             data-layer-ui="1">

            <!-- Media Tiles Container -->
            <div class="nsmhs-tiles-container">
                <?php $this->render_media_tiles($settings); ?>
            </div>

            <!-- Zoom Container -->
            <div class="nsmhs-zoom-container">
                <div class="nsmhs-zoom-content"></div>
            </div>

            <!-- Middle Pattern Layer -->
            <div class="nsmhs-mid-pattern"></div>

            <!-- Overlay Layer -->
            <div class="nsmhs-overlay"
                 data-overlay-type="<?php echo esc_attr($settings['layers']['mid']['overlay']['type']); ?>"
                 data-overlay-opacity="<?php echo esc_attr($settings['layers']['mid']['overlay']['opacity']); ?>"
                 data-overlay-speed="<?php echo esc_attr($settings['layers']['mid']['overlay']['speed']); ?>"
                 data-overlay-density="<?php echo esc_attr($settings['layers']['mid']['overlay']['density']); ?>"
                 data-overlay-blend="<?php echo esc_attr($settings['layers']['mid']['overlay']['blendMode']); ?>"
                 data-shadow-strength="<?php echo esc_attr($settings['layers']['mid']['shadowStrength']); ?>"
                 data-middle-pattern="<?php echo esc_attr($settings['layers']['mid']['middlePattern']); ?>">
            </div>

            <!-- Top Layer -->
            <div class="nsmhs-top-layer">
                <div class="nsmhs-content-container">
                    <?php if ($logo_position === 'aboveTitle' && (!empty($settings['layers']['top']['logoSrc']) || !empty($settings['layers']['top']['logoId']))): ?>
                    <div class="nsmhs-logo">
                        <?php echo $this->render_logo($settings['layers']['top']); ?>
                    </div>
                    <?php endif; ?>

                    <?php if (!empty($settings['layers']['top']['title'])): ?>
                    <h1 class="nsmhs-title">
                        <?php echo esc_html($settings['layers']['top']['title']); ?>
                    </h1>
                    <?php endif; ?>

                    <?php if (!empty($settings['layers']['top']['subtitle'])): ?>
                    <h2 class="nsmhs-subtitle">
                        <?php echo esc_html($settings['layers']['top']['subtitle']); ?>
                    </h2>
                    <?php endif; ?>

                    <?php if (!empty($settings['layers']['top']['ctaText']) && !empty($settings['layers']['top']['ctaUrl'])): ?>
                    <div class="nsmhs-cta">
                        <a href="<?php echo esc_url($settings['layers']['top']['ctaUrl']); ?>"
                           class="nsmhs-cta-button">
                            <?php echo esc_html($settings['layers']['top']['ctaText']); ?>
                        </a>
                    </div>
                    <?php endif; ?>

                    <?php if ($logo_position === 'belowCTA' && (!empty($settings['layers']['top']['logoSrc']) || !empty($settings['layers']['top']['logoId']))): ?>
                    <div class="nsmhs-logo">
                        <?php echo $this->render_logo($settings['layers']['top']); ?>
                    </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Settings Data -->
            <script type="application/json" class="nsmhs-settings">
                <?php echo wp_json_encode($settings); ?>
            </script>
        </div>
        <?php
        return ob_get_clean();
    }

    private function render_media_tiles($settings) {
        $grid_configs = [
            'pc' => $this->config->parse_grid($settings['grids']['pc']),
            'tablet' => $this->config->parse_grid($settings['grids']['tablet']),
            'phone' => $this->config->parse_grid($settings['grids']['phone'])
        ];

        $max_cells = max(
            $grid_configs['pc']['cols'] * $grid_configs['pc']['rows'],
            $grid_configs['tablet']['cols'] * $grid_configs['tablet']['rows'],
            $grid_configs['phone']['cols'] * $grid_configs['phone']['rows']
        );

        $media_items = array_slice($settings['media'], 0, $max_cells);

        foreach ($media_items as $index => $media) {
            $this->render_media_tile($media, $index);
        }
    }

    private function render_media_tile($media, $index) {
        $tile_class = 'nsmhs-tile nsmhs-tile-' . $index;

        if ($media['type'] === 'video') {
            ?>
            <div class="<?php echo esc_attr($tile_class); ?>" data-index="<?php echo esc_attr($index); ?>">
                <video class="nsmhs-media-element"
                       src="<?php echo esc_url($media['src']); ?>"
                       <?php if (!empty($media['poster'])): ?>
                       poster="<?php echo esc_url($media['poster']); ?>"
                       <?php endif; ?>
                       muted autoplay playsinline loop preload="metadata"
                       style="display: none;">
                </video>
                <?php if (!empty($media['poster'])): ?>
                <img class="nsmhs-poster-fallback"
                     src="<?php echo esc_url($media['poster']); ?>"
                     alt="">
                <?php endif; ?>
            </div>
            <?php
        } else {
            ?>
            <div class="<?php echo esc_attr($tile_class); ?>" data-index="<?php echo esc_attr($index); ?>">
                <img class="nsmhs-media-element"
                     src="<?php echo esc_url($media['src']); ?>"
                     alt="">
            </div>
            <?php
        }
    }

    private function generate_css_vars($settings) {
        $pc_grid = $this->config->parse_grid($settings['grids']['pc']);
        $tablet_grid = $this->config->parse_grid($settings['grids']['tablet']);
        $phone_grid = $this->config->parse_grid($settings['grids']['phone']);

        // グリッド設定に基づくaspect-ratio計算（16:9の各タイルベース）
        $pc_aspect_ratio = ($pc_grid['cols'] * 16) . '/' . ($pc_grid['rows'] * 9);
        $tablet_aspect_ratio = ($tablet_grid['cols'] * 16) . '/' . ($tablet_grid['rows'] * 9);
        $phone_aspect_ratio = ($phone_grid['cols'] * 16) . '/' . ($phone_grid['rows'] * 9);

        $vars = [
            '--nsmhs-display-duration' => $settings['timing']['displayDuration'] . 'ms',
            '--nsmhs-zoom-in-duration' => $settings['timing']['zoomInDuration'] . 'ms',
            '--nsmhs-zoom-out-duration' => $settings['timing']['zoomOutDuration'] . 'ms',
            '--nsmhs-easing' => $settings['timing']['easing'],
            '--nsmhs-opacity' => $settings['effects']['opacity'],
            '--nsmhs-blur' => $settings['effects']['blurPx'] . 'px',
            '--nsmhs-shadow-strength' => $settings['layers']['mid']['shadowStrength'],
            '--overlay-opacity' => $settings['layers']['mid']['overlay']['opacity'],
            '--overlay-blend' => $settings['layers']['mid']['overlay']['blendMode'],
            '--nsmhs-pc-cols' => $pc_grid['cols'],
            '--nsmhs-pc-rows' => $pc_grid['rows'],
            '--nsmhs-pc-aspect-ratio' => $pc_aspect_ratio,
            '--nsmhs-tablet-cols' => $tablet_grid['cols'],
            '--nsmhs-tablet-rows' => $tablet_grid['rows'],
            '--nsmhs-tablet-aspect-ratio' => $tablet_aspect_ratio,
            '--nsmhs-phone-cols' => $phone_grid['cols'],
            '--nsmhs-phone-rows' => $phone_grid['rows'],
            '--nsmhs-phone-aspect-ratio' => $phone_aspect_ratio
        ];

        $css_string = '';
        foreach ($vars as $property => $value) {
            $css_string .= $property . ': ' . $value . '; ';
        }

        return trim($css_string);
    }

    public function get_media_order($settings) {
        $pc_grid = $this->config->parse_grid($settings['grids']['pc']);
        $total_cells = $pc_grid['cols'] * $pc_grid['rows'];

        $order = [];

        if ($settings['order'] === 'rtl') {
            // Right to left, top to bottom
            for ($row = 0; $row < $pc_grid['rows']; $row++) {
                for ($col = $pc_grid['cols'] - 1; $col >= 0; $col--) {
                    $index = $row * $pc_grid['cols'] + $col;
                    if ($index < $total_cells) {
                        $order[] = $index;
                    }
                }
            }
        } else {
            // Left to right, top to bottom (default)
            for ($i = 0; $i < $total_cells; $i++) {
                $order[] = $i;
            }
        }

        return $order;
    }

    private function render_logo($logo_settings) {
        $logo_id = $logo_settings['logoId'] ?? 0;
        $logo_src = $logo_settings['logoSrc'] ?? '';
        $logo_alt = $logo_settings['logoAlt'] ?? '';

        // Priority: Use attachment ID if available
        if (!empty($logo_id) && is_numeric($logo_id)) {
            $attachment_id = absint($logo_id);

            // Check if attachment exists and is an image
            if (wp_attachment_is_image($attachment_id)) {
                $image_attributes = [
                    'alt' => $logo_alt,
                    'decoding' => 'async',
                    'fetchpriority' => 'high',
                    'draggable' => 'false'
                ];

                return wp_get_attachment_image($attachment_id, 'full', false, $image_attributes);
            }
        }

        // Fallback to URL method (backward compatibility)
        if (!empty($logo_src)) {
            return sprintf(
                '<img src="%s" alt="%s" decoding="async" fetchpriority="high" draggable="false">',
                esc_url($logo_src),
                esc_attr($logo_alt)
            );
        }

        return '';
    }
}