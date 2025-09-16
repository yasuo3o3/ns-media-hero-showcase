/**
 * NS Media Hero Showcase Gutenberg Block
 */

(function() {
    'use strict';

    const { registerBlockType } = wp.blocks;
    const { createElement: el, useState, Fragment } = wp.element;
    const { InspectorControls, MediaUpload, MediaUploadCheck } = wp.blockEditor;
    const { PanelBody, ExternalLink, Button, Notice, ToggleControl, SelectControl, RangeControl, __experimentalNumberControl: NumberControl } = wp.components;

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
            },
            tempMedia: {
                type: 'array',
                default: []
            },
            fullViewport: {
                type: 'boolean',
                default: false
            },
            logoPosition: {
                type: 'string',
                enum: ['aboveTitle', 'belowCTA'],
                default: 'aboveTitle'
            },
            contentScale: {
                type: 'number',
                default: 100
            },
            scaleDesktopOnly: {
                type: 'boolean',
                default: false
            }
        },

        edit: function(props) {
            const { attributes, setAttributes } = props;
            const { tempMedia, fullViewport, logoPosition, contentScale, scaleDesktopOnly } = attributes;

            const onSelectMedia = (media) => {
                const newMedia = media.map(item => ({
                    id: item.id,
                    url: item.url,
                    type: item.type,
                    mime: item.mime || '',
                    alt: item.alt || ''
                }));
                setAttributes({ tempMedia: newMedia });
            };

            const removeMedia = (index) => {
                const newMedia = [...tempMedia];
                newMedia.splice(index, 1);
                setAttributes({ tempMedia: newMedia });
            };

            const editorClasses = ['nsmhs-block-editor'];
            if (fullViewport) editorClasses.push('is-full-viewport');
            if (logoPosition === 'belowCTA') editorClasses.push('logo-below-cta');
            if (scaleDesktopOnly) editorClasses.push('scale-desktop-only');

            return el('div', {
                className: editorClasses.join(' '),
                style: {
                    '--hero-scale': contentScale / 100
                }
            }, [
                // Inspector Controls
                el(InspectorControls, {
                    key: 'inspector'
                }, [
                    el(PanelBody, {
                        title: 'クイックメディア選択',
                        key: 'quick-media'
                    }, [
                        el(Notice, {
                            status: 'info',
                            isDismissible: false,
                            key: 'notice'
                        }, '簡易選択のみ可能です。詳細設定は管理画面をご利用ください。'),

                        el(MediaUploadCheck, {
                            key: 'media-upload-check'
                        }, [
                            el(MediaUpload, {
                                onSelect: onSelectMedia,
                                allowedTypes: ['image', 'video'],
                                multiple: true,
                                render: ({ open }) => el(Button, {
                                    onClick: open,
                                    isPrimary: true,
                                    key: 'select-button'
                                }, 'メディアを選択'),
                                key: 'media-upload'
                            })
                        ]),

                        // Selected media preview
                        tempMedia.length > 0 && el('div', {
                            className: 'nsmhs-selected-media',
                            key: 'selected-media'
                        }, [
                            el('h4', { key: 'title' }, `選択中: ${tempMedia.length}件`),
                            ...tempMedia.map((media, index) =>
                                el('div', {
                                    className: 'nsmhs-media-item',
                                    key: media.id
                                }, [
                                    media.type === 'image'
                                        ? el('img', {
                                            src: media.url,
                                            alt: media.alt,
                                            style: { width: '50px', height: '50px', objectFit: 'cover' }
                                        })
                                        : el('span', {}, `🎬 ${media.type.toUpperCase()}`),
                                    el(Button, {
                                        onClick: () => removeMedia(index),
                                        isDestructive: true,
                                        isSmall: true
                                    }, '削除')
                                ])
                            )
                        ])
                    ]),

                    el(PanelBody, {
                        title: '詳細設定',
                        key: 'settings'
                    }, [
                        el('p', {
                            key: 'description'
                        }, 'グリッド設定、アニメーション、レイヤー設定などは管理画面で行えます。'),

                        el(ExternalLink, {
                            href: nsmhsBlock.settingsUrl,
                            key: 'settings-link'
                        }, nsmhsBlock.strings.settingsLink)
                    ]),

                    el(PanelBody, {
                        title: '表示設定',
                        key: 'display-settings'
                    }, [
                        el(ToggleControl, {
                            label: 'フルビューポート（100vw/100svh）',
                            checked: fullViewport,
                            onChange: (value) => setAttributes({ fullViewport: value }),
                            key: 'full-viewport'
                        }),

                        el(SelectControl, {
                            label: 'ロゴ位置',
                            value: logoPosition,
                            options: [
                                { label: '上（タイトル前）', value: 'aboveTitle' },
                                { label: '下（CTA後）', value: 'belowCTA' }
                            ],
                            onChange: (value) => setAttributes({ logoPosition: value }),
                            key: 'logo-position'
                        }),

                        el(RangeControl, {
                            label: '表示倍率（%）',
                            value: contentScale,
                            min: 70,
                            max: 100,
                            step: 1,
                            help: '推奨80–100%',
                            onChange: (value) => setAttributes({ contentScale: Math.max(70, Math.min(100, value)) }),
                            key: 'content-scale-range'
                        }),

                        el(NumberControl, {
                            label: '表示倍率（数値入力）',
                            value: contentScale,
                            min: 70,
                            max: 100,
                            onChange: (value) => setAttributes({ contentScale: Math.max(70, Math.min(100, parseInt(value) || 100)) }),
                            key: 'content-scale-number'
                        }),

                        el(ToggleControl, {
                            label: 'モバイルは常に100%',
                            checked: scaleDesktopOnly,
                            onChange: (value) => setAttributes({ scaleDesktopOnly: value }),
                            key: 'scale-desktop-only'
                        })
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
                        el('p', {}, nsmhsBlock.strings.preview),
                        tempMedia.length > 0 && el('small', {}, `選択中のメディア: ${tempMedia.length}件`)
                    ]),

                    el('div', {
                        className: 'nsmhs-preview-grid'
                    }, [
                        // Show selected media or sample grid
                        tempMedia.length > 0
                            ? tempMedia.slice(0, 15).map((media, i) =>
                                el('div', {
                                    key: media.id,
                                    className: 'nsmhs-preview-tile',
                                    style: {
                                        backgroundImage: media.type === 'image' ? `url(${media.url})` : 'none',
                                        backgroundColor: media.type === 'video' ? '#333' : 'transparent',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        animationDelay: `${i * 0.1}s`
                                    }
                                }, media.type === 'video' ? el('span', { style: { color: 'white', fontSize: '24px' } }, '🎬') : null)
                            )
                            : Array.from({length: 15}, (_, i) =>
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