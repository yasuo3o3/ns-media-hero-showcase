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

            // Calculate zoom transform
            const tileRect = tile.element.getBoundingClientRect();
            const containerRect = this.element.getBoundingClientRect();

            const scale = Math.max(containerRect.width / tileRect.width, containerRect.height / tileRect.height);

            // Set dimensions
            this.zoomContent.style.width = `${containerRect.width}px`;
            this.zoomContent.style.height = `${containerRect.height}px`;

            // Initial state: tile position with opacity and blur
            this.zoomContent.style.transform = `translate(${tileRect.left - containerRect.left}px, ${tileRect.top - containerRect.top}px) scale(${1/scale})`;
            this.zoomContent.style.opacity = '0';
            this.zoomContent.style.filter = `blur(var(--nsmhs-blur))`;

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
            const midLayer = this.element.querySelector('.ns-hero__mid');
            if (!midLayer) return;

            // Apply overlay settings
            this.applyOverlaySettings(midLayer);

            const overlayType = midLayer.dataset.overlayType;
            if (!overlayType || overlayType === 'none') return;

            // Handle CSS-based overlays
            if (['animated-gradient', 'dots', 'tiles'].includes(overlayType)) {
                return;
            }

            try {
                // Dynamic import of overlay module
                this.overlayModule = await import(`./overlays/${overlayType}.js`);

                // Create canvas element
                const canvas = document.createElement('canvas');
                midLayer.appendChild(canvas);

                // Extract settings from data attributes
                const overlaySettings = {
                    opacity: parseFloat(midLayer.dataset.overlayOpacity) || 0.25,
                    speed: parseFloat(midLayer.dataset.overlaySpeed) || 1,
                    density: midLayer.dataset.overlayDensity || 'medium',
                    blendMode: midLayer.dataset.overlayBlend || 'normal'
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

        applyOverlaySettings(midLayer) {
            const shadowStrength = Math.max(0, Math.min(1, parseFloat(midLayer.dataset.shadowStrength) || 0.6));
            const overlayType = midLayer.dataset.overlayType || 'constellation';

            // Set CSS variable for overlay alpha
            document.documentElement.style.setProperty('--nsmhs-overlay-alpha', shadowStrength);

            // Find or create overlay element
            let overlay = midLayer.querySelector('.nsmhs-overlay');
            if (!overlay && ['animated-gradient', 'dots', 'tiles'].includes(overlayType)) {
                overlay = document.createElement('div');
                overlay.className = 'nsmhs-overlay';
                midLayer.appendChild(overlay);
            }

            if (overlay) {
                // Reset existing overlay classes
                overlay.className = 'nsmhs-overlay';

                // Apply specific overlay type class
                if (['animated-gradient', 'dots', 'tiles'].includes(overlayType)) {
                    overlay.classList.add(`nsmhs-overlay--${overlayType}`);
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