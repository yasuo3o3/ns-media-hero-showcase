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
                    } else if (!this.isVisible && this.isPlaying) {
                        this.pauseAnimation();
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
                } else if (this.isVisible) {
                    this.resumeAnimation();
                }
            });
        }

        setupReducedMotionHandling() {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', (e) => {
                this.prefersReducedMotion = e.matches;
                if (this.prefersReducedMotion && this.isPlaying) {
                    this.adjustForReducedMotion();
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

            const scaleX = containerRect.width / tileRect.width;
            const scaleY = containerRect.height / tileRect.height;
            const scale = Math.max(scaleX, scaleY);

            const translateX = (containerRect.width / 2) - (tileRect.left - containerRect.left + tileRect.width / 2);
            const translateY = (containerRect.height / 2) - (tileRect.top - containerRect.top + tileRect.height / 2);

            // Apply initial transform (tile position)
            this.zoomContent.style.transform = `translate(${tileRect.left - containerRect.left}px, ${tileRect.top - containerRect.top}px) scale(${1/scale})`;
            this.zoomContent.style.width = `${tileRect.width * scale}px`;
            this.zoomContent.style.height = `${tileRect.height * scale}px`;

            // Show zoom content
            this.zoomContent.classList.add('nsmhs-active');

            // Apply tile effects during zoom
            tile.element.classList.add('nsmhs-zooming');

            // Start video if applicable
            this.startMediaPlayback(mediaClone);

            // Animate to full screen
            setTimeout(() => {
                if (this.isPaused) return;

                const duration = this.prefersReducedMotion ? 300 : this.settings.timing.zoomInDuration;

                this.zoomContent.style.transition = `transform ${duration}ms var(--nsmhs-easing)`;
                this.zoomContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`;

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

            // Animate out
            this.zoomContent.style.transition = `opacity ${duration}ms var(--nsmhs-easing), transform ${duration}ms var(--nsmhs-easing)`;
            this.zoomContent.style.opacity = '0';
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

        destroy() {
            this.stopAnimation();
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    }

    // Initialize all showcase instances when DOM is ready
    function initShowcases() {
        const showcases = document.querySelectorAll('.nsmhs-hero-showcase');
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