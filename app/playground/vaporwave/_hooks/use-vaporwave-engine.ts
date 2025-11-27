import { useEffect, useRef } from 'react';
import { generateCityData } from '../_utils/city-generator';

export const useVaporwaveEngine = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    const stateRef = useRef({
        speed: 0,
        time: 0,
        targetSpeed: 12,
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const offscreenCanvas = document.createElement('canvas');
        const offCtx = offscreenCanvas.getContext('2d', { alpha: false });

        let animationId: number;

        const drawStaticCity = (w: number, h: number) => {
            if (!offCtx) return;
            offscreenCanvas.width = w;
            offscreenCanvas.height = h;

            const horizonY = h * 0.55;
            const buildings = generateCityData(w, h);

            const grad = offCtx.createLinearGradient(0, 0, 0, horizonY);
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(1, '#4c1d95');
            offCtx.fillStyle = grad;
            offCtx.fillRect(0, 0, w, horizonY);

            offCtx.save();
            offCtx.shadowBlur = 20;
            offCtx.shadowColor = 'rgba(139, 92, 246, 0.3)';

            buildings.forEach(b => {
                const roofY = horizonY - b.height;
                const bGrad = offCtx.createLinearGradient(0, roofY, 0, horizonY);
                bGrad.addColorStop(0, '#172554');
                bGrad.addColorStop(1, '#020617');

                offCtx.fillStyle = bGrad;
                offCtx.fillRect(b.x, roofY, b.width, b.height);

                offCtx.strokeStyle = b.color;
                offCtx.lineWidth = 2;
                offCtx.strokeRect(b.x + 1, roofY + 1, b.width - 2, b.height);

                if (b.hasSpire) {
                    offCtx.beginPath();
                    offCtx.moveTo(b.x + b.width/2, roofY);
                    offCtx.lineTo(b.x + b.width/2, roofY - (b.height * 0.3));
                    offCtx.stroke();
                }

                offCtx.save();
                offCtx.lineWidth = 1;
                offCtx.globalAlpha = 0.4;

                offCtx.beginPath();
                for(let i = roofY + 15; i < horizonY; i += 12) {
                    offCtx.moveTo(b.x + 4, i);
                    offCtx.lineTo(b.x + b.width - 4, i);
                }
                offCtx.stroke();
                offCtx.restore();
            });
            offCtx.restore();

            offCtx.fillStyle = '#020617';
            offCtx.fillRect(0, horizonY, w, h - horizonY);
        };

        const renderLoop = () => {
            const { width: w, height: h } = stateRef.current;
            const horizonY = h * 0.55;

            stateRef.current.speed += (stateRef.current.targetSpeed - stateRef.current.speed) * 0.05;
            stateRef.current.time += stateRef.current.speed;

            ctx.drawImage(offscreenCanvas, 0, 0);

            ctx.save();
            ctx.beginPath();
            ctx.rect(0, horizonY, w, h - horizonY);
            ctx.clip();

            ctx.strokeStyle = '#d946ef';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#d946ef';
            ctx.shadowBlur = 10;

            const centerX = w / 2;
            const gap = 80;

            const linesCount = Math.ceil((w * 2) / gap);
            for (let i = -linesCount; i <= linesCount; i++) {
                const x = centerX + (i * gap);

                ctx.beginPath();
                ctx.moveTo(x, h);
                ctx.lineTo(centerX + (x - centerX) * 0.1, horizonY);
                ctx.stroke();
            }

            const offset = stateRef.current.time % 60;
            for (let i = 0; i < 20; i++) {
                const p = (i + (offset / 60)) / 20;
                const y = horizonY + Math.pow(p, 3) * (h - horizonY);

                if (p < 0.1) ctx.globalAlpha = p * 10;
                else ctx.globalAlpha = 1;

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            ctx.restore();

            drawCar(ctx, w, h);

            animationId = requestAnimationFrame(renderLoop);
        };

        const drawCar = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.save();
            const bounce = Math.sin(Date.now() / 150) * 3;
            ctx.translate(w/2, h * 0.8 + bounce);
            const scale = Math.min(1.2, w / 800);
            ctx.scale(scale, scale);

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(-90, 0);
            ctx.lineTo(-100, -25);
            ctx.lineTo(-70, -35);
            ctx.lineTo(-50, -50);
            ctx.lineTo(50, -50);
            ctx.lineTo(70, -35);
            ctx.lineTo(100, -25);
            ctx.lineTo(90, 0);
            ctx.fill();

            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 10;
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.fillRect(-85, -20, 30, 6);
            ctx.fillRect(55, -20, 30, 6);
            ctx.fillStyle = '#b91c1c';
            ctx.shadowBlur = 0;
            ctx.fillRect(-20, -20, 40, 6);

            if (Math.random() > 0.3) {
                ctx.fillStyle = '#3b82f6';
                ctx.shadowColor = '#3b82f6';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.moveTo(-60, 5);
                ctx.lineTo(-65, 15 + Math.random()*15);
                ctx.lineTo(-55, 5);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(60, 5);
                ctx.lineTo(65, 15 + Math.random()*15);
                ctx.lineTo(55, 5);
                ctx.fill();
            }
            ctx.restore();
        };

        const handleResize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            ctx.scale(dpr, dpr);

            stateRef.current.width = window.innerWidth;
            stateRef.current.height = window.innerHeight;

            drawStaticCity(stateRef.current.width, stateRef.current.height);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        renderLoop();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, [canvasRef]);
};