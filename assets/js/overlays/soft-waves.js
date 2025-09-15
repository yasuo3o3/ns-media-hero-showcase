/**
 * Soft Waves Overlay Module
 * 2-3レイヤーの波形パスを半透明で横スクロール
 */

export function init(canvas, { opacity, speed, density, blendMode }, env) {
    const ctx = canvas.getContext('2d');
    let waves = [];
    let animationId = null;
    let isRunning = false;
    let lastTime = 0;
    let renderTimeSum = 0;
    let renderTimeCount = 0;
    let currentDensity = density;
    let currentPixelRatio = env.pixelRatio;

    // 密度に応じた波の数
    const waveCounts = {
        low: 2,
        medium: 3,
        high: 4
    };

    // 波クラス
    class Wave {
        constructor(index) {
            this.amplitude = (Math.random() * 30 + 20) * currentPixelRatio;
            this.frequency = Math.random() * 0.01 + 0.005;
            this.offset = Math.random() * Math.PI * 2;
            this.speed = speed * (0.5 + Math.random() * 0.5);
            this.y = canvas.height * (0.2 + index * 0.25);
            this.alpha = Math.random() * 0.3 + 0.15;
            this.direction = Math.random() > 0.5 ? 1 : -1;
        }

        update(deltaTime) {
            this.offset += this.speed * this.direction * deltaTime * 0.001;
        }

        draw() {
            ctx.save();

            // グラデーション作成
            const gradient = ctx.createLinearGradient(0, this.y - this.amplitude, 0, this.y + this.amplitude);
            gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.alpha * opacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

            ctx.beginPath();
            ctx.moveTo(0, this.y);

            // 波形を描画
            for (let x = 0; x <= canvas.width; x += 2) {
                const y = this.y + Math.sin(x * this.frequency + this.offset) * this.amplitude;
                ctx.lineTo(x, y);
            }

            // 波の下部を塗りつぶすためのパスを作成
            ctx.lineTo(canvas.width, this.y + this.amplitude * 2);
            ctx.lineTo(0, this.y + this.amplitude * 2);
            ctx.closePath();

            ctx.fillStyle = gradient;
            ctx.fill();

            // 波のライン
            ctx.beginPath();
            ctx.moveTo(0, this.y);
            for (let x = 0; x <= canvas.width; x += 2) {
                const y = this.y + Math.sin(x * this.frequency + this.offset) * this.amplitude;
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * opacity * 0.7})`;
            ctx.lineWidth = 1 * currentPixelRatio;
            ctx.stroke();

            ctx.restore();
        }
    }

    function initWaves() {
        waves = [];
        const count = waveCounts[currentDensity] || waveCounts.medium;
        for (let i = 0; i < count; i++) {
            waves.push(new Wave(i));
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

        // 波の更新と描画
        waves.forEach(wave => {
            wave.update(deltaTime);
            wave.draw();
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
            initWaves();
        } else if (currentDensity === 'medium') {
            currentDensity = 'low';
            initWaves();
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

        // 波の位置を再計算
        waves.forEach((wave, index) => {
            wave.y = canvas.height * (0.2 + index * 0.25);
            wave.amplitude = (Math.random() * 30 + 20) * currentPixelRatio;
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
        waves = [];
    }

    // 初期化
    resize();
    initWaves();

    return {
        start,
        stop,
        resize,
        destroy
    };
}