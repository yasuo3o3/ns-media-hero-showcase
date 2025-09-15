/**
 * Morph Polygons Overlay Module
 * 3-5角の多角形を数個描画し、頂点をノイズで揺らして形状変形、微速回転
 */

export function init(canvas, { opacity, speed, density, blendMode }, env) {
    const ctx = canvas.getContext('2d');
    let polygons = [];
    let animationId = null;
    let isRunning = false;
    let lastTime = 0;
    let renderTimeSum = 0;
    let renderTimeCount = 0;
    let currentDensity = density;
    let currentPixelRatio = env.pixelRatio;

    // 密度に応じた多角形数
    const polygonCounts = {
        low: 3,
        medium: 5,
        high: 8
    };

    // 多角形クラス
    class MorphPolygon {
        constructor() {
            this.sides = Math.floor(Math.random() * 3) + 3; // 3-5角形
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.baseRadius = (Math.random() * 80 + 40) * currentPixelRatio;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.5 * speed;
            this.noiseOffset = Math.random() * 1000;
            this.noiseSpeed = speed * 0.001;
            this.alpha = Math.random() * 0.3 + 0.1;

            // 各頂点のノイズオフセット
            this.vertexNoises = [];
            for (let i = 0; i < this.sides; i++) {
                this.vertexNoises.push(Math.random() * 1000);
            }
        }

        update(deltaTime) {
            this.rotation += this.rotationSpeed * deltaTime * 0.001;
            this.noiseOffset += this.noiseSpeed * deltaTime;
        }

        // シンプルなノイズ関数
        noise(x) {
            x = Math.sin(x) * 10000;
            return x - Math.floor(x);
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            ctx.beginPath();
            for (let i = 0; i < this.sides; i++) {
                const angle = (i / this.sides) * Math.PI * 2;

                // ノイズで半径を変動
                const noiseValue = this.noise(this.noiseOffset + this.vertexNoises[i]);
                const radiusVariation = (noiseValue - 0.5) * 20 * currentPixelRatio;
                const radius = this.baseRadius + radiusVariation;

                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();

            // グラデーション塗りつぶし
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.baseRadius);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.alpha * opacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

            ctx.fillStyle = gradient;
            ctx.fill();

            // 輪郭線
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * opacity * 0.5})`;
            ctx.lineWidth = 1 * currentPixelRatio;
            ctx.stroke();

            ctx.restore();
        }
    }

    function initPolygons() {
        polygons = [];
        const count = polygonCounts[currentDensity] || polygonCounts.medium;
        for (let i = 0; i < count; i++) {
            polygons.push(new MorphPolygon());
        }
    }

    function render(currentTime) {
        if (!isRunning) return;

        const renderStart = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // リサイズチェック
        if (canvas.width !== canvas.offsetWidth * currentPixelRatio ||
            canvas.height !== canvas.offsetHeight * currentPixelRatio) {
            resize();
        }

        // クリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 多角形更新と描画
        polygons.forEach(polygon => {
            polygon.update(deltaTime);
            polygon.draw();
        });

        // パフォーマンス監視
        const renderTime = performance.now() - renderStart;
        renderTimeSum += renderTime;
        renderTimeCount++;

        if (renderTimeCount >= 60) {
            const avgRenderTime = renderTimeSum / renderTimeCount;
            if (avgRenderTime > 25) {
                downgrade();
            }
            renderTimeSum = 0;
            renderTimeCount = 0;
        }

        if (env.capFps && deltaTime < 33) {
            setTimeout(() => {
                animationId = requestAnimationFrame(render);
            }, 33 - deltaTime);
        } else {
            animationId = requestAnimationFrame(render);
        }
    }

    function downgrade() {
        if (currentDensity === 'high') {
            currentDensity = 'medium';
            initPolygons();
        } else if (currentDensity === 'medium') {
            currentDensity = 'low';
            initPolygons();
        } else if (currentPixelRatio > 1) {
            currentPixelRatio = 1;
            resize();
        }
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * currentPixelRatio;
        canvas.height = rect.height * currentPixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(currentPixelRatio, currentPixelRatio);

        // 多角形の位置とサイズを調整
        polygons.forEach(polygon => {
            polygon.x = Math.random() * canvas.width;
            polygon.y = Math.random() * canvas.height;
            polygon.baseRadius = (Math.random() * 80 + 40) * currentPixelRatio;
        });
    }

    function start() {
        if (isRunning) return;
        if (env.reducedMotion) return;

        isRunning = true;
        lastTime = performance.now();
        animationId = requestAnimationFrame(render);
    }

    function stop() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function destroy() {
        stop();
        polygons = [];
    }

    // 初期化
    resize();
    initPolygons();

    return {
        start,
        stop,
        resize,
        destroy
    };
}