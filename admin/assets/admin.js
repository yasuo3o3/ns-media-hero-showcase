/**
 * NS Media Hero Showcase Admin JavaScript
 *
 * Handles the admin interface functionality including:
 * - Media library picker integration
 * - Media item management (add, remove, sort)
 * - Form handling and AJAX submissions
 * - Range slider updates
 * - Dynamic form field visibility
 */

(function($) {
    'use strict';

    class NSMHSAdmin {
        constructor() {
            this.mediaIndex = 0;
            this.isLoading = false;
            this.settings = window.nsmhsSettings || {};

            this.init();
        }

        init() {
            this.setupEventHandlers();
            this.populateMediaList();
            this.setupRangeSliders();
            this.setupSortable();
            this.setupFormSubmission();
        }

        setupEventHandlers() {
            // Add media button
            $('#nsmhs-add-media').on('click', (e) => {
                e.preventDefault();
                this.addMediaItem();
            });

            // Remove media handler (delegated)
            $(document).on('click', '.nsmhs-media-remove', (e) => {
                e.preventDefault();
                this.removeMediaItem($(e.target).closest('.nsmhs-media-item'));
            });

            // Media selection handlers (delegated)
            $(document).on('click', '.nsmhs-select-media', (e) => {
                e.preventDefault();
                this.openMediaPicker($(e.target).closest('.nsmhs-media-item'), 'media');
            });

            $(document).on('click', '.nsmhs-clear-media', (e) => {
                e.preventDefault();
                this.clearMedia($(e.target).closest('.nsmhs-media-item'));
            });

            // Poster selection handlers (delegated)
            $(document).on('click', '.nsmhs-select-poster', (e) => {
                e.preventDefault();
                this.openMediaPicker($(e.target).closest('.nsmhs-media-item'), 'poster');
            });

            $(document).on('click', '.nsmhs-clear-poster', (e) => {
                e.preventDefault();
                this.clearPoster($(e.target).closest('.nsmhs-media-item'));
            });

            // Range slider handlers (delegated)
            $(document).on('input', 'input[type="range"]', (e) => {
                this.updateRangeValue($(e.target));
            });

            // Logo selection handlers
            $('#select-logo').on('click', (e) => {
                e.preventDefault();
                this.openLogoPicker();
            });

            $('#clear-logo').on('click', (e) => {
                e.preventDefault();
                this.clearLogo();
            });
        }

        openMediaPicker($item, purpose) {
            const mediaFrame = wp.media({
                title: purpose === 'poster' ? 'ポスターを選択' : 'メディアを選択',
                library: {
                    type: purpose === 'poster' ? ['image'] : ['image', 'video']
                },
                multiple: false,
                button: {
                    text: '選択'
                }
            });

            // When media is selected
            mediaFrame.on('select', () => {
                const attachment = mediaFrame.state().get('selection').first().toJSON();

                if (purpose === 'poster') {
                    this.setPosterMedia($item, attachment);
                } else {
                    this.setMainMedia($item, attachment);
                }
            });

            mediaFrame.open();
        }

        setMainMedia($item, attachment) {
            const type = attachment.type === 'image' ? 'image' : 'video';

            // Update hidden fields
            $item.find('.nsmhs-media-type').val(type);
            $item.find('.nsmhs-media-src').val(attachment.url);
            $item.find('.nsmhs-media-mime').val(attachment.mime || '');

            // Update type display
            $item.find('.nsmhs-media-type-display').text(type === 'image' ? '画像' : '動画');

            // Show preview
            this.updateMediaPreview($item, attachment, type);

            // Show/hide poster section
            if (type === 'video') {
                $item.find('.nsmhs-poster-section').show();
            } else {
                $item.find('.nsmhs-poster-section').hide();
                this.clearPoster($item);
            }

            // Show clear button
            $item.find('.nsmhs-clear-media').show();
        }

        setPosterMedia($item, attachment) {
            // Update poster field
            $item.find('.nsmhs-media-poster').val(attachment.url);

            // Update poster preview
            const $posterPreview = $item.find('.nsmhs-poster-preview');
            $posterPreview.find('img').attr('src', attachment.url).attr('alt', attachment.alt || '');
            $posterPreview.show();

            // Show clear poster button
            $item.find('.nsmhs-clear-poster').show();
        }

        updateMediaPreview($item, attachment, type) {
            const $preview = $item.find('.nsmhs-media-preview');

            if (type === 'image') {
                const $imagePreview = $item.find('.nsmhs-preview-image');
                $imagePreview.find('img').attr('src', attachment.url).attr('alt', attachment.alt || '');
                $imagePreview.show();
                $item.find('.nsmhs-preview-video').hide();
            } else {
                const $videoPreview = $item.find('.nsmhs-preview-video');
                const extension = this.getFileExtension(attachment.url);
                $videoPreview.find('.nsmhs-video-extension').text(extension);
                $videoPreview.show();
                $item.find('.nsmhs-preview-image').hide();
            }

            $preview.show();
        }

        getFileExtension(url) {
            const match = url.match(/\.([^.]+)$/);
            return match ? match[1].toUpperCase() : 'VIDEO';
        }

        clearMedia($item) {
            // Clear main media fields
            $item.find('.nsmhs-media-type').val('image');
            $item.find('.nsmhs-media-src').val('');
            $item.find('.nsmhs-media-mime').val('');

            // Reset type display
            $item.find('.nsmhs-media-type-display').text('画像');

            // Hide preview and clear button
            $item.find('.nsmhs-media-preview').hide();
            $item.find('.nsmhs-clear-media').hide();

            // Hide poster section and clear poster
            $item.find('.nsmhs-poster-section').hide();
            this.clearPoster($item);
        }

        clearPoster($item) {
            // Clear poster field
            $item.find('.nsmhs-media-poster').val('');

            // Hide poster preview and clear button
            $item.find('.nsmhs-poster-preview').hide();
            $item.find('.nsmhs-clear-poster').hide();
        }

        openLogoPicker() {
            const mediaFrame = wp.media({
                title: 'ロゴを選択',
                library: {
                    type: ['image']
                },
                multiple: false,
                button: {
                    text: '選択'
                }
            });

            // When logo is selected
            mediaFrame.on('select', () => {
                const attachment = mediaFrame.state().get('selection').first().toJSON();
                this.setLogo(attachment);
            });

            mediaFrame.open();
        }

        setLogo(attachment) {
            // Update form fields
            $('#logo-id').val(attachment.id);
            $('#logo-src').val(attachment.url);
            $('#logo-alt').val(attachment.alt || attachment.title || '');

            // Update preview
            const $preview = $('#logo-preview');
            $preview.find('img').attr('src', attachment.url).attr('alt', attachment.alt || '');
            $preview.show();

            // Show clear button
            $('#clear-logo').show();
        }

        clearLogo() {
            // Clear form fields
            $('#logo-id').val('0');
            $('#logo-src').val('');
            $('#logo-alt').val('');

            // Hide preview and clear button
            $('#logo-preview').hide();
            $('#clear-logo').hide();
        }

        populateMediaList() {
            const $mediaList = $('#nsmhs-media-list');
            $mediaList.empty();

            if (this.settings.media && this.settings.media.length > 0) {
                this.settings.media.forEach((media, index) => {
                    this.addMediaItem(media, index);
                });
            }

            this.updateMediaIndices();
        }

        addMediaItem(mediaData = null, index = null) {
            const $mediaList = $('#nsmhs-media-list');
            const template = $('#nsmhs-media-template').html();

            if (!template) {
                console.error('Media template not found');
                return;
            }

            if (index === null) {
                index = this.mediaIndex++;
            } else {
                this.mediaIndex = Math.max(this.mediaIndex, index + 1);
            }

            let html = template.replace(/\{\{index\}\}/g, index);
            const $item = $(html);

            // Populate data if provided
            if (mediaData && mediaData.src) {
                const type = mediaData.type || 'image';

                // Set form data
                $item.find('.nsmhs-media-type').val(type);
                $item.find('.nsmhs-media-src').val(mediaData.src);
                $item.find('.nsmhs-media-mime').val(mediaData.mime || '');

                // Update display
                $item.find('.nsmhs-media-type-display').text(type === 'image' ? '画像' : '動画');

                // Create attachment-like object for preview
                const attachment = {
                    url: mediaData.src,
                    type: type,
                    mime: mediaData.mime || ''
                };

                this.updateMediaPreview($item, attachment, type);
                $item.find('.nsmhs-clear-media').show();

                // Handle poster for videos
                if (type === 'video') {
                    $item.find('.nsmhs-poster-section').show();

                    if (mediaData.poster) {
                        $item.find('.nsmhs-media-poster').val(mediaData.poster);
                        const $posterPreview = $item.find('.nsmhs-poster-preview');
                        $posterPreview.find('img').attr('src', mediaData.poster);
                        $posterPreview.show();
                        $item.find('.nsmhs-clear-poster').show();
                    }
                }
            }

            $mediaList.append($item);
            this.updateMediaIndices();
        }

        removeMediaItem($item) {
            if (confirm(nsmhs_admin.strings.delete_confirm)) {
                $item.remove();
                this.updateMediaIndices();
            }
        }

        updateMediaIndices() {
            $('.nsmhs-media-item').each((index, item) => {
                const $item = $(item);
                $item.attr('data-index', index);

                // Update input names
                $item.find('.nsmhs-media-type').attr('name', `media[${index}][type]`);
                $item.find('.nsmhs-media-src').attr('name', `media[${index}][src]`);
                $item.find('.nsmhs-media-mime').attr('name', `media[${index}][mime]`);
                $item.find('.nsmhs-media-poster').attr('name', `media[${index}][poster]`);
            });
        }

        setupRangeSliders() {
            $('input[type="range"]').each((index, element) => {
                this.updateRangeValue($(element));
            });
        }

        updateRangeValue($range) {
            const value = $range.val();
            const $valueDisplay = $range.siblings('.nsmhs-range-value');
            $valueDisplay.text(value);
        }

        setupSortable() {
            if (typeof $.fn.sortable !== 'function') {
                console.warn('jQuery UI Sortable not available');
                return;
            }

            $('#nsmhs-media-list').sortable({
                handle: '.nsmhs-media-drag',
                placeholder: 'nsmhs-media-placeholder',
                start: function(e, ui) {
                    ui.item.addClass('nsmhs-dragging');
                },
                stop: (e, ui) => {
                    ui.item.removeClass('nsmhs-dragging');
                    this.updateMediaIndices();
                }
            });
        }

        setupFormSubmission() {
            $('#nsmhs-settings-form').on('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        saveSettings() {
            if (this.isLoading) return;

            const formData = this.collectFormData();
            this.setLoading(true);

            $.ajax({
                url: nsmhs_admin.ajax_url,
                type: 'POST',
                data: {
                    action: 'nsmhs_save_settings',
                    nonce: nsmhs_admin.nonce,
                    settings: JSON.stringify(formData)
                },
                success: (response) => {
                    this.setLoading(false);
                    if (response.success) {
                        this.showMessage(response.data, 'success');
                    } else {
                        this.showMessage(response.data || nsmhs_admin.strings.save_error, 'error');
                    }
                },
                error: () => {
                    this.setLoading(false);
                    this.showMessage(nsmhs_admin.strings.save_error, 'error');
                }
            });
        }

        collectFormData() {
            const data = {
                media: [],
                grids: {},
                order: '',
                timing: {},
                effects: {},
                layers: {
                    mid: {},
                    top: {}
                }
            };

            // Collect media items
            $('.nsmhs-media-item').each((index, item) => {
                const $item = $(item);
                const src = $item.find('.nsmhs-media-src').val();

                if (src) {
                    const mediaItem = {
                        type: $item.find('.nsmhs-media-type').val(),
                        src: src,
                        mime: $item.find('.nsmhs-media-mime').val()
                    };

                    const poster = $item.find('.nsmhs-media-poster').val();
                    if (poster && mediaItem.type === 'video') {
                        mediaItem.poster = poster;
                    }

                    data.media.push(mediaItem);
                }
            });

            // Collect grids
            data.grids.pc = $('select[name="grids[pc]"]').val();
            data.grids.tablet = $('select[name="grids[tablet]"]').val();
            data.grids.phone = $('select[name="grids[phone]"]').val();

            // Collect order
            data.order = $('input[name="order"]:checked').val();

            // Collect timing
            data.timing.displayDuration = parseInt($('input[name="timing[displayDuration]"]').val());
            data.timing.zoomInDuration = parseInt($('input[name="timing[zoomInDuration]"]').val());
            data.timing.zoomOutDuration = parseInt($('input[name="timing[zoomOutDuration]"]').val());
            data.timing.easing = 'ease-in-out';

            // Collect effects
            data.effects.opacity = parseFloat($('input[name="effects[opacity]"]').val());
            data.effects.blurPx = parseInt($('input[name="effects[blurPx]"]').val());

            // Collect layers
            data.layers.mid.enabled = $('input[name="layers[mid][enabled]"]').is(':checked');
            data.layers.mid.shadowStrength = parseFloat($('input[name="layers[mid][shadowStrength]"]').val());
            data.layers.mid.overlay = {
                type: $('select[name="layers[mid][overlay][type]"]').val(),
                opacity: parseFloat($('input[name="layers[mid][overlay][opacity]"]').val()),
                speed: parseFloat($('input[name="layers[mid][overlay][speed]"]').val()),
                density: $('select[name="layers[mid][overlay][density]"]').val(),
                blendMode: $('select[name="layers[mid][overlay][blendMode]"]').val()
            };

            data.layers.top.title = $('input[name="layers[top][title]"]').val();
            data.layers.top.subtitle = $('input[name="layers[top][subtitle]"]').val();
            data.layers.top.ctaText = $('input[name="layers[top][ctaText]"]').val();
            data.layers.top.ctaUrl = $('input[name="layers[top][ctaUrl]"]').val();
            data.layers.top.logoId = parseInt($('input[name="layers[top][logoId]"]').val()) || 0;
            data.layers.top.logoSrc = $('input[name="layers[top][logoSrc]"]').val();
            data.layers.top.logoAlt = $('input[name="layers[top][logoAlt]"]').val();

            return data;
        }

        setLoading(loading) {
            this.isLoading = loading;
            const $form = $('#nsmhs-settings-form');
            const $submit = $('#submit');

            if (loading) {
                $form.addClass('nsmhs-loading');
                $submit.prop('disabled', true);
            } else {
                $form.removeClass('nsmhs-loading');
                $submit.prop('disabled', false);
            }
        }

        showMessage(message, type) {
            // Remove existing messages
            $('.nsmhs-message').remove();

            const $message = $('<div>', {
                class: `nsmhs-message ${type}`,
                text: message
            });

            $message.insertAfter('.wrap h1');

            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    $message.fadeOut();
                }, 3000);
            }
        }
    }

    // Initialize when document is ready
    $(document).ready(() => {
        new NSMHSAdmin();
    });

})(jQuery);