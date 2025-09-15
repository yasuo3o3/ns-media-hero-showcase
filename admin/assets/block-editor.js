/**
 * NS Media Hero Showcase Gutenberg Block
 */

(function() {
    'use strict';

    const { registerBlockType } = wp.blocks;
    const { createElement: el } = wp.element;
    const { InspectorControls } = wp.blockEditor;
    const { PanelBody, ExternalLink } = wp.components;

    registerBlockType('nsmhs/hero-showcase', {
        title: nsmhsBlock.strings.title,
        description: nsmhsBlock.strings.description,
        icon: 'format-gallery',
        category: 'media',
        keywords: ['hero', 'showcase', 'media', 'gallery', 'slider'],

        attributes: {
            id: {
                type: 'string',
                default: 'default'
            }
        },

        edit: function(props) {
            return el('div', {
                className: 'nsmhs-block-editor'
            }, [
                // Inspector Controls
                el(InspectorControls, {
                    key: 'inspector'
                }, [
                    el(PanelBody, {
                        title: nsmhsBlock.strings.title,
                        key: 'settings'
                    }, [
                        el('p', {
                            key: 'description'
                        }, nsmhsBlock.strings.description),

                        el(ExternalLink, {
                            href: nsmhsBlock.settingsUrl,
                            key: 'settings-link'
                        }, nsmhsBlock.strings.settingsLink)
                    ])
                ]),

                // Block Preview
                el('div', {
                    className: 'nsmhs-block-preview',
                    key: 'preview'
                }, [
                    el('div', {
                        className: 'nsmhs-preview-header'
                    }, [
                        el('h3', {}, nsmhsBlock.strings.title),
                        el('p', {}, nsmhsBlock.strings.preview)
                    ]),

                    el('div', {
                        className: 'nsmhs-preview-grid'
                    }, [
                        // Sample grid layout
                        ...Array.from({length: 15}, (_, i) =>
                            el('div', {
                                key: i,
                                className: 'nsmhs-preview-tile',
                                style: {
                                    backgroundColor: `hsl(${(i * 30) % 360}, 50%, 70%)`,
                                    animationDelay: `${i * 0.1}s`
                                }
                            })
                        )
                    ]),

                    el('div', {
                        className: 'nsmhs-preview-overlay'
                    }, [
                        el('h1', {}, 'Sample Title'),
                        el('p', {}, 'Sample subtitle text'),
                        el('a', {
                            className: 'nsmhs-preview-cta',
                            href: '#'
                        }, 'Sample CTA')
                    ])
                ])
            ]);
        },

        save: function() {
            // Return null since this is a dynamic block
            return null;
        }
    });

})();