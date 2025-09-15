<?php

defined('ABSPATH') || exit;

class NSMHS_Config {

    private static $instance = null;
    private $option_name = 'nsmhs_settings';

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Initialize AJAX handlers
        add_action('wp_ajax_nsmhs_save_settings', [$this, 'ajax_save_settings']);
        add_action('wp_ajax_nsmhs_get_settings', [$this, 'ajax_get_settings']);
    }

    public function get_settings() {
        $settings = get_option($this->option_name, []);
        return wp_parse_args($settings, $this->get_default_settings());
    }

    public function get_default_settings() {
        return [
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
                    'middlePattern' => 'none',
                    'shadowStrength' => 0.25,
                    'overlay' => [
                        'type' => 'constellation',
                        'opacity' => 0.25,
                        'speed' => 1,
                        'density' => 'medium',
                        'blendMode' => 'normal'
                    ]
                ],
                'top' => [
                    'title' => '',
                    'subtitle' => '',
                    'ctaText' => '',
                    'ctaUrl' => '',
                    'logoId' => 0,
                    'logoSrc' => '',
                    'logoAlt' => ''
                ]
            ]
        ];
    }

    public function validate_settings($input) {
        $validated = [];

        // Validate media array
        if (isset($input['media']) && is_array($input['media'])) {
            $validated['media'] = [];
            foreach ($input['media'] as $media) {
                if (!is_array($media)) continue;

                $item = [];
                $item['type'] = in_array($media['type'] ?? '', ['image', 'video']) ? $media['type'] : 'image';
                $item['src'] = esc_url_raw($media['src'] ?? '');

                // Validate MIME type
                $mime = $media['mime'] ?? '';
                $allowed_mimes = [
                    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                    'video/mp4', 'video/webm', 'video/ogg'
                ];

                if (in_array($mime, $allowed_mimes)) {
                    $item['mime'] = $mime;

                    // Auto-set type based on MIME
                    if (strpos($mime, 'image/') === 0) {
                        $item['type'] = 'image';
                    } elseif (strpos($mime, 'video/') === 0) {
                        $item['type'] = 'video';
                    }
                }

                if ($item['type'] === 'video') {
                    $item['poster'] = esc_url_raw($media['poster'] ?? '');
                }

                if (!empty($item['src'])) {
                    $validated['media'][] = $item;
                }
            }
        }

        // Validate grids
        $allowed_grids = ['3x2', '3x4', '4x2', '5x3', '5x4'];
        $validated['grids'] = [
            'pc' => in_array($input['grids']['pc'] ?? '', $allowed_grids) ? $input['grids']['pc'] : '5x3',
            'tablet' => in_array($input['grids']['tablet'] ?? '', $allowed_grids) ? $input['grids']['tablet'] : '4x2',
            'phone' => in_array($input['grids']['phone'] ?? '', $allowed_grids) ? $input['grids']['phone'] : '3x2'
        ];

        // Validate order
        $validated['order'] = in_array($input['order'] ?? '', ['ltr', 'rtl']) ? $input['order'] : 'ltr';

        // Validate timing
        $validated['timing'] = [
            'displayDuration' => max(1000, min(10000, intval($input['timing']['displayDuration'] ?? 3000))),
            'zoomInDuration' => max(300, min(3000, intval($input['timing']['zoomInDuration'] ?? 900))),
            'zoomOutDuration' => max(300, min(3000, intval($input['timing']['zoomOutDuration'] ?? 700))),
            'easing' => sanitize_text_field($input['timing']['easing'] ?? 'ease-in-out')
        ];

        // Validate effects
        $validated['effects'] = [
            'opacity' => max(0, min(1, floatval($input['effects']['opacity'] ?? 1))),
            'blurPx' => max(0, min(20, intval($input['effects']['blurPx'] ?? 6)))
        ];

        // Validate layers
        $validated['layers'] = [
            'mid' => [
                'enabled' => !empty($input['layers']['mid']['enabled']),
                'middlePattern' => in_array($input['layers']['mid']['middlePattern'] ?? 'none', ['none', 'animated-gradient', 'dots', 'tiles']) ? $input['layers']['mid']['middlePattern'] : 'none',
                'shadowStrength' => max(0, min(1, floatval($input['layers']['mid']['shadowStrength'] ?? 0.25))),
                'overlay' => $this->validate_overlay_settings($input['layers']['mid']['overlay'] ?? [])
            ],
            'top' => [
                'title' => sanitize_text_field($input['layers']['top']['title'] ?? ''),
                'subtitle' => sanitize_text_field($input['layers']['top']['subtitle'] ?? ''),
                'ctaText' => sanitize_text_field($input['layers']['top']['ctaText'] ?? ''),
                'ctaUrl' => esc_url_raw($input['layers']['top']['ctaUrl'] ?? ''),
                'logoId' => $this->validate_logo_id($input['layers']['top']['logoId'] ?? 0),
                'logoSrc' => $this->validate_logo_url($input['layers']['top']['logoSrc'] ?? ''),
                'logoAlt' => sanitize_text_field($input['layers']['top']['logoAlt'] ?? '')
            ]
        ];

        return $validated;
    }

    private function validate_logo_id($logo_id) {
        $logo_id = absint($logo_id);

        if ($logo_id > 0) {
            // Check if attachment exists and is an image
            $attachment = get_post($logo_id);
            if (!$attachment || $attachment->post_type !== 'attachment') {
                return 0;
            }

            $mime_type = get_post_mime_type($logo_id);
            if (!$mime_type || strpos($mime_type, 'image/') !== 0) {
                return 0;
            }
        }

        return $logo_id;
    }

    private function validate_logo_url($logo_url) {
        $logo_url = esc_url_raw($logo_url);

        if (!empty($logo_url)) {
            // Check MIME type if URL is provided
            $file_info = wp_check_filetype($logo_url);
            $allowed_image_types = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'svg' => 'image/svg+xml'
            ];

            if (!empty($file_info['ext']) && !array_key_exists($file_info['ext'], $allowed_image_types)) {
                return '';
            }
        }

        return $logo_url;
    }

    private function validate_overlay_settings($overlay_input) {
        $allowed_types = ['none', 'constellation', 'morph-polygons', 'soft-waves'];
        $allowed_densities = ['low', 'medium', 'high'];
        $allowed_blend_modes = ['normal', 'screen', 'overlay', 'multiply'];

        $validated = [
            'type' => in_array($overlay_input['type'] ?? '', $allowed_types) ? $overlay_input['type'] : 'constellation',
            'opacity' => max(0, min(1, floatval($overlay_input['opacity'] ?? 0.25))),
            'speed' => max(0.25, min(2, floatval($overlay_input['speed'] ?? 1))),
            'density' => in_array($overlay_input['density'] ?? '', $allowed_densities) ? $overlay_input['density'] : 'medium',
            'blendMode' => in_array($overlay_input['blendMode'] ?? '', $allowed_blend_modes) ? $overlay_input['blendMode'] : 'normal'
        ];

        return $validated;
    }

    public function save_settings($settings) {
        $validated = $this->validate_settings($settings);
        return update_option($this->option_name, $validated);
    }

    public function ajax_save_settings() {
        if (!current_user_can('manage_options')) {
            wp_die(__('権限がありません', 'ns-media-hero-showcase'));
        }

        if (!wp_verify_nonce($_POST['nonce'] ?? '', 'nsmhs_admin_nonce')) {
            wp_die(__('セキュリティチェックに失敗しました', 'ns-media-hero-showcase'));
        }

        $settings = json_decode(stripslashes($_POST['settings'] ?? ''), true);

        if ($settings === null) {
            wp_send_json_error(__('無効な設定データです', 'ns-media-hero-showcase'));
        }

        $result = $this->save_settings($settings);

        if ($result) {
            wp_send_json_success(__('設定を保存しました', 'ns-media-hero-showcase'));
        } else {
            wp_send_json_error(__('設定の保存に失敗しました', 'ns-media-hero-showcase'));
        }
    }

    public function ajax_get_settings() {
        if (!current_user_can('manage_options')) {
            wp_die(__('権限がありません', 'ns-media-hero-showcase'));
        }

        if (!wp_verify_nonce($_GET['nonce'] ?? '', 'nsmhs_admin_nonce')) {
            wp_die(__('セキュリティチェックに失敗しました', 'ns-media-hero-showcase'));
        }

        wp_send_json_success($this->get_settings());
    }

    public function parse_grid($grid_string) {
        $parts = explode('x', $grid_string);
        return [
            'cols' => intval($parts[0] ?? 3),
            'rows' => intval($parts[1] ?? 2)
        ];
    }

    public function get_grid_cells($grid_string) {
        $grid = $this->parse_grid($grid_string);
        return $grid['cols'] * $grid['rows'];
    }
}