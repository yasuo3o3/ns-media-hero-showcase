/**
 * NS Media Hero Showcase Admin JavaScript
 *
 * Handles the admin interface functionality including:
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

            // Media type change handler (delegated)
            $(document).on('change', '.nsmhs-media-type', (e) => {
                this.handleMediaTypeChange($(e.target));
            });

            // Range slider handlers (delegated)
            $(document).on('input', 'input[type="range"]', (e) => {
                this.updateRangeValue($(e.target));
            });
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
            if (mediaData) {
                $item.find('.nsmhs-media-type').val(mediaData.type || 'image');
                $item.find('.nsmhs-media-src').val(mediaData.src || '');
                if (mediaData.poster) {
                    $item.find('.nsmhs-media-poster').val(mediaData.poster);
                }

                // Show/hide poster field based on type
                this.handleMediaTypeChange($item.find('.nsmhs-media-type'));
            }

            $mediaList.append($item);
            this.updateMediaIndices();

            // Focus on the new item's source input
            setTimeout(() => {
                $item.find('.nsmhs-media-src').focus();
            }, 100);
        }

        removeMediaItem($item) {
            if (confirm(nsmhs_admin.strings.delete_confirm)) {
                $item.remove();
                this.updateMediaIndices();
            }
        }

        handleMediaTypeChange($select) {
            const $item = $select.closest('.nsmhs-media-item');
            const $posterField = $item.find('.nsmhs-poster-field');
            const type = $select.val();

            if (type === 'video') {
                $posterField.show();
            } else {
                $posterField.hide();
                $posterField.find('input').val('');
            }
        }

        updateMediaIndices() {
            $('.nsmhs-media-item').each((index, item) => {
                const $item = $(item);
                $item.attr('data-index', index);

                // Update input names
                $item.find('.nsmhs-media-type').attr('name', `media[${index}][type]`);
                $item.find('.nsmhs-media-src').attr('name', `media[${index}][src]`);
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
                const mediaItem = {
                    type: $item.find('.nsmhs-media-type').val(),
                    src: $item.find('.nsmhs-media-src').val()
                };

                const poster = $item.find('.nsmhs-media-poster').val();
                if (poster && mediaItem.type === 'video') {
                    mediaItem.poster = poster;
                }

                if (mediaItem.src) {
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
            data.layers.mid.overlayVideoSrc = $('input[name="layers[mid][overlayVideoSrc]"]').val();

            data.layers.top.title = $('input[name="layers[top][title]"]').val();
            data.layers.top.subtitle = $('input[name="layers[top][subtitle]"]').val();
            data.layers.top.ctaText = $('input[name="layers[top][ctaText]"]').val();
            data.layers.top.ctaUrl = $('input[name="layers[top][ctaUrl]"]').val();
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