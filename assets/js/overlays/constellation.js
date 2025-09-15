/**
 * Constellation Overlay Module
 * 粒子間に線を描画し、ゆっくり移動するコンステレーション効果
 */

export function init(canvas, { opacity, speed, density, blendMode }, env) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;
    let isRunning = false;
    let lastTime = 0;
    let renderTimeSum = 0;
    let renderTimeCount = 0;
    let currentDensity = density;
    let currentPixelRatio = env.pixelRatio;

    // 密度に応じた粒子数（見やすさ重視で調整）
    const particleCounts = {
        low: 40,
        medium: 60,
        high: 80
    };

    // 粒子クラス
    class Particle {
        constructor() {
            this.reset();
            this.vx = (Math.random() - 0.5) * (0.8 + Math.random() * 0.4) * speed;
            this.vy = (Math.random() - 0.5) * (0.8 + Math.random() * 0.4) * speed;
            this.size = 2 + Math.random() * 2; // 2~4px
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        update(deltaTime) {
            this.x += this.vx * deltaTime * 0.01;
            this.y += this.vy * deltaTime * 0.01;

            // 画面外に出たら反対側から出現
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * currentPixelRatio, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = particleCounts[currentDensity] || particleCounts.medium;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        const maxDistance = 135; // 見やすさ重視で120~150pxの中間値
        const maxDistanceSquared = maxDistance * maxDistance;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared < maxDistanceSquared) {
                    const distance = Math.sqrt(distanceSquared);
                    const alpha = (1 - distance / maxDistance) * 0.3; // 強化した線の透明度

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.lineWidth = 1.2 * currentPixelRatio; // 太くした線幅
                    ctx.stroke();
                }
            }
        }
    }

    function render(currentTime) {
        if (!isRunning) return;

        const renderStart = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // リサイズチェック（パフォーマンス重視でrequestAnimationFrameで対応）
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== rect.width * currentPixelRatio ||
            canvas.height !== rect.height * currentPixelRatio) {
            resize();
        }

        // クリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // パーティクル更新と描画
        particles.forEach(particle => {
            particle.update(deltaTime);
            particle.draw();
        });

        // 接続線描画
        drawConnections();

        // パフォーマンス監視
        const renderTime = performance.now() - renderStart;
        renderTimeSum += renderTime;
        renderTimeCount++;

        if (renderTimeCount >= 60) { // 60フレーム毎にチェック
            const avgRenderTime = renderTimeSum / renderTimeCount;
            if (avgRenderTime > 25) { // 25ms以上かかっている場合
                downgrade();
            }
            renderTimeSum = 0;
            renderTimeCount = 0;
        }

        if (env.capFps && deltaTime < 33) { // 30fps制限
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
            initParticles();
        } else if (currentDensity === 'medium') {
            currentDensity = 'low';
            initParticles();
        } else if (currentPixelRatio > 1) {
            currentPixelRatio = 1;
            resize();
        }
    }

    function resize() {
        // ウィンドウの実際のサイズを取得
        const rect = canvas.getBoundingClientRect();
        const newWidth = rect.width;
        const newHeight = rect.height;

        // Canvasの実際の描画サイズを設定
        canvas.width = newWidth * currentPixelRatio;
        canvas.height = newHeight * currentPixelRatio;

        // CSSサイズを設定（表示サイズ）
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';

        // コンテキストのスケールを設定
        ctx.setTransform(currentPixelRatio, 0, 0, currentPixelRatio, 0, 0);

        // パーティクル位置をリセット
        particles.forEach(particle => particle.reset());
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
        particles = [];
    }

    // 初期化
    resize();
    initParticles();

    return {
        start,
        stop,
        resize,
        destroy
    };
}