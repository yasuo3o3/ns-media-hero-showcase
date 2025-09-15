/**
 * NS Media Hero Showcase Frontend JavaScript
 *
 * Handles the zoom animation sequence for media tiles.
 * Features:
 * - Sequential tile zoom animation
 * - Support for both images and videos
 * - Reduced motion support
 * - IntersectionObserver for performance
 * - Tab visibility handling
 */

(function() {
    'use strict';

    class NSMediaHeroShowcase {
        constructor(element) {
            this.element = element;
            this.settings = this.parseSettings();
            this.tiles = [];
            this.currentIndex = 0;
            this.isPlaying = false;
            this.isPaused = false;
            this.timeoutId = null;
            this.zoomContainer = null;
            this.zoomContent = null;
            this.observer = null;
            this.isVisible = false;
            this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Overlay control
            this.overlayInstance = null;
            this.overlayModule = null;

            this.init();
        }

        parseSettings() {
            const script = this.element.querySelector('.nsmhs-settings');
            if (script) {
                try {
                    return JSON.parse(script.textContent);
                } catch (e) {
                    console.warn('Failed to parse NSMHS settings:', e);
                }
            }
            return this.getDefaultSettings();
        }

        getDefaultSettings() {
            return {
                media: [],
                order: 'ltr',
                timing: {
                    displayDuration: 3000,
                    zoomInDuration: 900,
                    zoomOutDuration: 700
                },
                effects: {
                    opacity: 1,
                    blurPx: 6
                }
            };
        }

        init() {
            this.zoomContainer = this.element.querySelector('.nsmhs-zoom-container');
            this.zoomContent = this.element.querySelector('.nsmhs-zoom-content');

            if (!this.zoomContainer || !this.zoomContent) {
                console.warn('NSMHS: Required DOM elements not found');
                return;
            }

            this.collectTiles();
            this.setupIntersectionObserver();
            this.setupVisibilityHandling();
            this.setupReducedMotionHandling();
            this.setupResizeObserver();
            this.initializeOverlay();

            // Start the animation if tiles are available
            if (this.tiles.length > 0) {
                this.startAnimation();
            }
        }

        collectTiles() {
            const tileElements = this.element.querySelectorAll('.nsmhs-tile');
            this.tiles = Array.from(tileElements).map((tile, index) => ({
                element: tile,
                index: index,
                media: tile.querySelector('.nsmhs-media-element'),
                poster: tile.querySelector('.nsmhs-poster-fallback'),
                type: tile.querySelector('video') ? 'video' : 'image'
            })).filter(tile => tile.media || tile.poster);

            // Sort tiles based on order setting
            if (this.settings.order === 'rtl') {
                this.tiles = this.calculateRTLOrder();
            }
        }

        calculateRTLOrder() {
            // Get grid dimensions from CSS custom properties
            const style = getComputedStyle(this.element);
            const cols = parseInt(style.getPropertyValue('--nsmhs-pc-cols')) || 5;
            const rows = parseInt(style.getPropertyValue('--nsmhs-pc-rows')) || 3;

            const orderedTiles = [];
            for (let row = 0; row < rows; row++) {
                for (let col = cols - 1; col >= 0; col--) {
                    const index = row * cols + col;
                    if (index < this.tiles.length) {
                        orderedTiles.push(this.tiles[index]);
                    }
                }
            }
            return orderedTiles;
        }

        setupIntersectionObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    this.isVisible = entry.isIntersecting;
                    if (this.isVisible && !this.isPlaying) {
                        this.resumeAnimation();
                        this.startOverlay();
                    } else if (!this.isVisible && this.isPlaying) {
                        this.pauseAnimation();
                        this.stopOverlay();
                    }
                });
            }, {
                threshold: 0.1
            });

            this.observer.observe(this.element);
        }

        setupVisibilityHandling() {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseAnimation();
                    this.stopOverlay();
                } else if (this.isVisible) {
                    this.recalculateLayout();
                    this.resumeAnimation();
                    this.startOverlay();
                }
            });
        }

        setupReducedMotionHandling() {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', (e) => {
                this.prefersReducedMotion = e.matches;
                if (this.prefersReducedMotion) {
                    this.adjustForReducedMotion();
                    this.stopOverlay();
                } else if (this.isVisible) {
                    this.startOverlay();
                }
            });
        }

        startAnimation() {
            if (this.isPlaying) return;

            this.isPlaying = true;
            this.isPaused = false;
            this.currentIndex = 0;
            this.nextTile();
        }

        pauseAnimation() {
            this.isPaused = true;
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
            this.pauseAllVideos();
        }

        resumeAnimation() {
            if (!this.isPaused || !this.isVisible) return;

            this.isPaused = false;
            this.nextTile();
        }

        setupResizeObserver() {
            if ('ResizeObserver' in window) {
                this.resizeObserver = new ResizeObserver(() => {
                    if (this.zoomContent.classList.contains('nsmhs-active')) {
                        this.resetZoom();
                    }
                    this.recalculateLayout();
                });
                this.resizeObserver.observe(this.element);
            }
        }

        recalculateLayout() {
            this.collectTiles();
        }

        stopAnimation() {
            this.isPlaying = false;
            this.isPaused = false;
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
            this.resetZoom();
            this.pauseAllVideos();
        }

        nextTile() {
            if (this.isPaused || !this.isPlaying || this.tiles.length === 0) return;

            const tile = this.tiles[this.currentIndex];
            this.zoomToTile(tile);

            this.currentIndex = (this.currentIndex + 1) % this.tiles.length;
        }

        zoomToTile(tile) {
            // Clone the media element for zoom display
            const mediaClone = this.createMediaClone(tile);

            // Clear previous content
            this.zoomContent.innerHTML = '';
            this.zoomContent.appendChild(mediaClone);

            // Use requestAnimationFrame to ensure fresh rect calculations
            requestAnimationFrame(() => {
                // Check if zoom-from-tile feature is enabled
                const style = getComputedStyle(this.element);
                const raw = (style.getPropertyValue('--nsmhs-zoom-from-tile') || '').trim();
                const zoomFromTile = raw === '1' || raw === ''; // 空なら既定でON

                // Calculate positions and scales
                const tileRect = tile.element.getBoundingClientRect();
                const containerRect = this.element.getBoundingClientRect();

                // Set dimensions
                this.zoomContent.style.width = `${containerRect.width}px`;
                this.zoomContent.style.height = `${containerRect.height}px`;

                let initialTransform, initialOpacity, initialFilter;

                if (zoomFromTile) {
                    // New tile-to-center animation
                    // Calculate tile center relative to container
                    const tileRelativeLeft = tileRect.left - containerRect.left;
                    const tileRelativeTop = tileRect.top - containerRect.top;
                    const tileCenterX = tileRelativeLeft + tileRect.width / 2;
                    const tileCenterY = tileRelativeTop + tileRect.height / 2;

                    // Container center is at (width/2, height/2)
                    const containerCenterX = containerRect.width / 2;
                    const containerCenterY = containerRect.height / 2;

                    // Calculate translation from tile center to container center
                    const deltaX = containerCenterX - tileCenterX;
                    const deltaY = containerCenterY - tileCenterY;

                    // Calculate scale from tile size to a reasonable zoom size (not full container)
                    let scaleFromTile = Math.min(tileRect.width / containerRect.width, tileRect.height / containerRect.height);
                    scaleFromTile = Math.min(scaleFromTile, 1); // >1 にならない保険（常に“縮小”スタート）

                    initialTransform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleFromTile})`;
                    initialOpacity = '0';
                    initialFilter = `blur(var(--nsmhs-blur, 8px))`;
                } else {
                    // Original large-to-normal animation
                    const scale = Math.max(containerRect.width / tileRect.width, containerRect.height / tileRect.height);
                    initialTransform = `translate(${tileRect.left - containerRect.left}px, ${tileRect.top - containerRect.top}px) scale(${1/scale})`;
                    initialOpacity = '0';
                    initialFilter = `blur(var(--nsmhs-blur, 8px))`;
                }

                // Set initial state
                this.zoomContent.style.transform = initialTransform;
                this.zoomContent.style.opacity = initialOpacity;
                this.zoomContent.style.filter = initialFilter;

                // Show zoom content
                this.zoomContent.classList.add('nsmhs-active');

                // Apply tile effects during zoom
                tile.element.classList.add('nsmhs-zooming');

                // Animate to full screen
                setTimeout(() => {
                    if (this.isPaused) return;

                    const duration = this.prefersReducedMotion ? 300 : this.settings.timing.zoomInDuration;

                    this.zoomContent.style.transition = `transform ${duration}ms var(--nsmhs-easing), opacity ${duration}ms var(--nsmhs-easing), filter ${duration}ms var(--nsmhs-easing)`;
                    this.zoomContent.style.transform = `translate(0px, 0px) scale(1)`;
                    this.zoomContent.style.opacity = '1';
                    this.zoomContent.style.filter = 'none';

                    // Start video after animation begins
                    this.startMediaPlayback(mediaClone);

                    // Hold at full screen
                    this.timeoutId = setTimeout(() => {
                        if (this.isPaused) return;
                        this.zoomOut(tile);
                    }, this.settings.timing.displayDuration);

                }, 50);
            });
        }

        zoomOut(tile) {
            if (this.isPaused) return;

            const duration = this.prefersReducedMotion ? 300 : this.settings.timing.zoomOutDuration;

            // Animate out with blur
            this.zoomContent.style.transition = `opacity ${duration}ms var(--nsmhs-easing), filter ${duration}ms var(--nsmhs-easing), transform ${duration}ms var(--nsmhs-easing)`;
            this.zoomContent.style.opacity = '0';
            this.zoomContent.style.filter = `blur(var(--nsmhs-blur))`;
            this.zoomContent.style.transform = 'scale(1.1)';

            // Remove tile effects
            tile.element.classList.remove('nsmhs-zooming');

            setTimeout(() => {
                this.resetZoom();
                if (!this.isPaused && this.isPlaying) {
                    this.timeoutId = setTimeout(() => this.nextTile(), 100);
                }
            }, duration);
        }

        createMediaClone(tile) {
            if (tile.type === 'video' && tile.media) {
                const video = document.createElement('video');
                video.src = tile.media.src;
                video.poster = tile.media.poster;
                video.muted = true;
                video.autoplay = true;
                video.playsinline = true;
                video.loop = true;
                video.preload = 'metadata';
                return video;
            } else {
                const img = document.createElement('img');
                img.src = tile.media ? tile.media.src : tile.poster.src;
                img.alt = '';
                return img;
            }
        }

        startMediaPlayback(mediaElement) {
            if (mediaElement.tagName === 'VIDEO') {
                mediaElement.currentTime = 0;
                const playPromise = mediaElement.play();
                if (playPromise) {
                    playPromise.catch(error => {
                        console.warn('Video autoplay failed:', error);
                    });
                }
            }
        }

        pauseAllVideos() {
            const videos = this.element.querySelectorAll('video');
            videos.forEach(video => {
                if (!video.paused) {
                    video.pause();
                }
            });
        }

        resetZoom() {
            this.zoomContent.classList.remove('nsmhs-active');
            this.zoomContent.style.opacity = '';
            this.zoomContent.style.transform = '';
            this.zoomContent.style.transition = '';
            this.zoomContent.style.width = '';
            this.zoomContent.style.height = '';

            // Remove all tile effects
            this.tiles.forEach(tile => {
                tile.element.classList.remove('nsmhs-zooming');
            });
        }

        adjustForReducedMotion() {
            // Reduce animation durations and effects for reduced motion
            if (this.prefersReducedMotion) {
                this.element.style.setProperty('--nsmhs-zoom-in-duration', '300ms');
                this.element.style.setProperty('--nsmhs-zoom-out-duration', '300ms');
                this.element.style.setProperty('--nsmhs-blur', '0px');
            }
        }

        async initializeOverlay() {
            const overlayLayer = this.element.querySelector('.nsmhs-overlay');
            if (!overlayLayer) return;

            // Apply all layer settings
            this.applyLayerSettings();

            const overlayType = overlayLayer.dataset.overlayType;
            if (!overlayType || overlayType === 'none') return;

            // Handle canvas-based overlays only
            if (['constellation', 'morph-polygons', 'soft-waves'].includes(overlayType)) {
                try {
                    // Dynamic import of overlay module
                    this.overlayModule = await import(`./overlays/${overlayType}.js`);

                    // Create canvas element
                    const canvas = document.createElement('canvas');
                    overlayLayer.appendChild(canvas);

                    // Extract settings from data attributes
                    const overlaySettings = {
                        opacity: parseFloat(overlayLayer.dataset.overlayOpacity) || 0.25,
                        speed: parseFloat(overlayLayer.dataset.overlaySpeed) || 1,
                        density: overlayLayer.dataset.overlayDensity || 'medium',
                        blendMode: overlayLayer.dataset.overlayBlend || 'normal'
                    };

                    // Environment settings
                    const env = {
                        reducedMotion: this.prefersReducedMotion,
                        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
                        capFps: true,
                        width: canvas.offsetWidth,
                        height: canvas.offsetHeight
                    };

                    // Initialize overlay
                    this.overlayInstance = this.overlayModule.init(canvas, overlaySettings, env);

                    // Start if visible and not reduced motion
                    if (this.isVisible && !this.prefersReducedMotion) {
                        this.overlayInstance.start();
                    }

                    // Setup resize handling
                    window.addEventListener('resize', this.handleOverlayResize.bind(this));

                } catch (error) {
                    console.warn(`Failed to load overlay module ${overlayType}:`, error);
                }
            }
        }

        applyLayerSettings() {
            const overlayLayer = this.element.querySelector('.nsmhs-overlay');
            if (!overlayLayer) return;

            // Get settings from data attributes
            const shadowStrength = Math.max(0, Math.min(1, parseFloat(overlayLayer.dataset.shadowStrength) || 0.6));

            // Set CSS variables for layer alpha values
            document.documentElement.style.setProperty('--nsmhs-mid-alpha', shadowStrength);

            // Get pattern settings from data attributes
            const middlePattern = overlayLayer.dataset.middlePattern || 'none';

            // Apply middle pattern
            const midLayer = this.element.querySelector('.nsmhs-mid-pattern');
            if (midLayer) {
                midLayer.className = 'nsmhs-mid-pattern';
                if (middlePattern !== 'none') {
                    midLayer.classList.add(`nsmhs-mid-pattern--${middlePattern}`);
                }
            }
        }

        handleOverlayResize() {
            if (this.overlayInstance && this.overlayInstance.resize) {
                this.overlayInstance.resize();
            }
        }

        startOverlay() {
            if (this.overlayInstance && !this.prefersReducedMotion && this.isVisible) {
                this.overlayInstance.start();
            }
        }

        stopOverlay() {
            if (this.overlayInstance) {
                this.overlayInstance.stop();
            }
        }

        // Layer Debug Controls
        setLayerFlags(flags) {
            // flags: {tiles, zoom, pattern, overlay, ui} - each should be 0 or 1
            const defaults = {tiles: 1, zoom: 1, pattern: 1, overlay: 1, ui: 1};
            const settings = {...defaults, ...flags};

            // Set data attributes
            this.element.setAttribute('data-layer-tiles', String(settings.tiles));
            this.element.setAttribute('data-layer-zoom', String(settings.zoom));
            this.element.setAttribute('data-layer-pattern', String(settings.pattern));
            this.element.setAttribute('data-layer-overlay', String(settings.overlay));
            this.element.setAttribute('data-layer-ui', String(settings.ui));

            // Stop processes for disabled layers
            if (settings.overlay === 0) {
                this.stopOverlay();
            }

            if (settings.zoom === 0) {
                this.pauseAnimation();
                this.resetZoom();
            }

            // Restart if layers are re-enabled and visible
            if (settings.overlay === 1 && this.isVisible && !this.prefersReducedMotion) {
                this.startOverlay();
            }

            if (settings.zoom === 1 && this.isVisible && !this.isPaused) {
                this.resumeAnimation();
            }
        }

        getLayerFlags() {
            return {
                tiles: parseInt(this.element.getAttribute('data-layer-tiles')) || 1,
                zoom: parseInt(this.element.getAttribute('data-layer-zoom')) || 1,
                pattern: parseInt(this.element.getAttribute('data-layer-pattern')) || 1,
                overlay: parseInt(this.element.getAttribute('data-layer-overlay')) || 1,
                ui: parseInt(this.element.getAttribute('data-layer-ui')) || 1
            };
        }

        destroy() {
            this.stopAnimation();
            this.stopOverlay();
            if (this.overlayInstance && this.overlayInstance.destroy) {
                this.overlayInstance.destroy();
            }
            if (this.observer) {
                this.observer.disconnect();
            }
            window.removeEventListener('resize', this.handleOverlayResize);
        }
    }

    // Initialize all showcase instances when DOM is ready
    function initShowcases() {
        const showcases = document.querySelectorAll('.ns-hero, .nsmhs-hero-showcase');
        showcases.forEach(element => {
            if (!element.nsmhsInstance) {
                element.nsmhsInstance = new NSMediaHeroShowcase(element);
            }
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShowcases);
    } else {
        initShowcases();
    }

    // Re-initialize on dynamic content changes (for block editor, etc.)
    if (window.MutationObserver) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('nsmhs-hero-showcase')) {
                            if (!node.nsmhsInstance) {
                                node.nsmhsInstance = new NSMediaHeroShowcase(node);
                            }
                        } else {
                            const showcases = node.querySelectorAll && node.querySelectorAll('.nsmhs-hero-showcase');
                            if (showcases) {
                                showcases.forEach(element => {
                                    if (!element.nsmhsInstance) {
                                        element.nsmhsInstance = new NSMediaHeroShowcase(element);
                                    }
                                });
                            }
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Expose for debugging
    window.NSMediaHeroShowcase = NSMediaHeroShowcase;

})();