import { useEffect, useRef } from 'react';
import { generateCityData } from '../_utils/city-generator';

export const useVaporwaveEngine = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    const stateRef = useRef({
        speed: 12,
        targetSpeed: 12,
        time: 0,
        width: 0,
        height: 0,
        steerX: 0,
        currentSteerX: 0,
        isTurbo: false,
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

            // 1. Céu em gradiente vertical cósmico
            const skyGrad = offCtx.createLinearGradient(0, 0, 0, horizonY);
            skyGrad.addColorStop(0, '#0b0f19');
            skyGrad.addColorStop(0.6, '#1e1138');
            skyGrad.addColorStop(1, '#4a154b');
            offCtx.fillStyle = skyGrad;
            offCtx.fillRect(0, 0, w, horizonY);

            // 2. Sol Retrowave 80s (Synthwave Sliced Sun)
            const sunRadius = Math.min(w * 0.16, horizonY * 0.48);
            const sunX = w / 2;
            const sunY = horizonY - sunRadius * 0.35;

            // Halo suave atrás do sol
            const haloGrad = offCtx.createRadialGradient(sunX, sunY, sunRadius * 0.3, sunX, sunY, sunRadius * 2);
            haloGrad.addColorStop(0, 'rgba(251, 146, 60, 0.3)');
            haloGrad.addColorStop(0.5, 'rgba(217, 70, 239, 0.15)');
            haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            offCtx.fillStyle = haloGrad;
            offCtx.fillRect(sunX - sunRadius * 2, sunY - sunRadius * 2, sunRadius * 4, sunRadius * 4);

            // Disco solar fatiado
            offCtx.save();
            offCtx.beginPath();
            offCtx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
            offCtx.clip();

            const sunGrad = offCtx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
            sunGrad.addColorStop(0, '#fef08a');
            sunGrad.addColorStop(0.45, '#f43f5e');
            sunGrad.addColorStop(1, '#c026d3');
            offCtx.fillStyle = sunGrad;
            offCtx.fillRect(sunX - sunRadius, sunY - sunRadius, sunRadius * 2, sunRadius * 2);

            // Fatias horizontais características dos anos 80
            offCtx.fillStyle = '#1e1138';
            const numSlices = 7;
            for (let s = 0; s < numSlices; s++) {
                const sliceY = sunY + (s / numSlices) * sunRadius;
                const sliceHeight = 2 + s * 2.2;
                offCtx.fillRect(sunX - sunRadius, sliceY, sunRadius * 2, sliceHeight);
            }
            offCtx.restore();

            // 3. Prédios da Cidade Procedural (silhueta preservando a essência original)
            const buildings = generateCityData(w);

            offCtx.save();
            offCtx.shadowBlur = 15;
            offCtx.shadowColor = 'rgba(139, 92, 246, 0.35)';

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
                    offCtx.moveTo(b.x + b.width / 2, roofY);
                    offCtx.lineTo(b.x + b.width / 2, roofY - (b.height * 0.3));
                    offCtx.stroke();
                }

                offCtx.save();
                offCtx.lineWidth = 1;
                offCtx.globalAlpha = 0.4;
                offCtx.beginPath();
                for (let i = roofY + 15; i < horizonY; i += 12) {
                    offCtx.moveTo(b.x + 4, i);
                    offCtx.lineTo(b.x + b.width - 4, i);
                }
                offCtx.stroke();
                offCtx.restore();
            });
            offCtx.restore();

            // 4. Base do chão (abaixo do horizonte)
            const groundGrad = offCtx.createLinearGradient(0, horizonY, 0, h);
            groundGrad.addColorStop(0, '#020617');
            groundGrad.addColorStop(1, '#0f051d');
            offCtx.fillStyle = groundGrad;
            offCtx.fillRect(0, horizonY, w, h - horizonY);

            // Névoa neon na linha do horizonte
            const mistGrad = offCtx.createLinearGradient(0, horizonY - 10, 0, horizonY + 30);
            mistGrad.addColorStop(0, 'rgba(217, 70, 239, 0)');
            mistGrad.addColorStop(0.5, 'rgba(217, 70, 239, 0.25)');
            mistGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
            offCtx.fillStyle = mistGrad;
            offCtx.fillRect(0, horizonY - 10, w, 40);
        };

        const renderLoop = () => {
            const { width: w, height: h } = stateRef.current;
            if (w === 0 || h === 0) {
                animationId = requestAnimationFrame(renderLoop);
                return;
            }

            const horizonY = h * 0.55;

            // Interpolação suave de velocidade e pilotagem
            stateRef.current.speed += (stateRef.current.targetSpeed - stateRef.current.speed) * 0.08;
            stateRef.current.time += stateRef.current.speed;
            stateRef.current.currentSteerX += (stateRef.current.steerX - stateRef.current.currentSteerX) * 0.06;

            const steer = stateRef.current.currentSteerX;
            const centerX = w / 2;

            // 1. Desenhar a cidade estática do offscreenCanvas (custo nulo por frame)
            ctx.drawImage(offscreenCanvas, 0, 0);

            // 2. Chão e Grid 3D de alta performance
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, horizonY, w, h - horizonY);
            ctx.clip();

            const gap = 80;
            const linesCount = Math.ceil((w * 1.8) / gap);
            const vanishX = centerX - steer * (w * 0.08);

            // Camada 1: Glow suave do grid (traço mais largo com opacidade, sem shadowBlur pesado)
            ctx.strokeStyle = 'rgba(217, 70, 239, 0.22)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i = -linesCount; i <= linesCount; i++) {
                const x = centerX + (i * gap) + (steer * 60);
                ctx.moveTo(x, h);
                ctx.lineTo(vanishX + (x - centerX) * 0.08, horizonY);
            }
            ctx.stroke();

            // Camada 2: Núcleo nítido do grid vertical
            ctx.strokeStyle = '#d946ef';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = -linesCount; i <= linesCount; i++) {
                const x = centerX + (i * gap) + (steer * 60);
                ctx.moveTo(x, h);
                ctx.lineTo(vanishX + (x - centerX) * 0.08, horizonY);
            }
            ctx.stroke();

            // Linhas horizontais do grid (batched com perspectiva exponencial)
            const offset = stateRef.current.time % 60;
            ctx.strokeStyle = '#d946ef';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 20; i++) {
                const p = (i + (offset / 60)) / 20;
                const y = horizonY + Math.pow(p, 2.8) * (h - horizonY);

                ctx.globalAlpha = p < 0.15 ? p / 0.15 : Math.min(1, 0.2 + p * 0.8);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            ctx.globalAlpha = 1.0;
            ctx.restore();

            // 3. Desenhar o Carro com pilotagem e reação ao turbo
            drawCar(ctx, w, h, steer, stateRef.current.speed > 16);

            animationId = requestAnimationFrame(renderLoop);
        };

        const drawCar = (ctx: CanvasRenderingContext2D, w: number, h: number, steer: number, isTurbo: boolean) => {
            ctx.save();
            const bounce = Math.sin(Date.now() / 140) * (isTurbo ? 4.5 : 2.5);
            const carX = (w / 2) + (steer * (w * 0.22));
            const carY = h * 0.8 + bounce;
            const tilt = steer * 0.08;

            ctx.translate(carX, carY);
            ctx.rotate(tilt);

            const scale = Math.min(1.2, w / 800);
            ctx.scale(scale, scale);

            // Sombra e reflexo neon sob o chassi
            ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
            ctx.beginPath();
            ctx.ellipse(0, 8, 90, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            // Chassi principal do carro (preto profundo fosco)
            ctx.fillStyle = '#05070f';
            ctx.beginPath();
            ctx.moveTo(-90, 0);
            ctx.lineTo(-100, -25);
            ctx.lineTo(-70, -35);
            ctx.lineTo(-50, -50);
            ctx.lineTo(50, -50);
            ctx.lineTo(70, -35);
            ctx.lineTo(100, -25);
            ctx.lineTo(90, 0);
            ctx.closePath();
            ctx.fill();

            // Contorno ciano neon nítido
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Lanternas traseiras em LED vermelho/rubi
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-85, -20, 30, 6);
            ctx.fillRect(55, -20, 30, 6);
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(-20, -20, 40, 6);

            // Brilho difuso suave nas lanternas
            ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
            ctx.fillRect(-88, -22, 36, 10);
            ctx.fillRect(52, -22, 36, 10);

            // Chamas do escapamento (azul elétrico / neon, intensificadas no turbo)
            const flameIntensity = isTurbo ? 1.8 : 1.0;
            const flameLen = (15 + Math.random() * 20) * flameIntensity;

            ctx.fillStyle = isTurbo ? '#38bdf8' : '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(-62, 5);
            ctx.lineTo(-65, 12 + flameLen);
            ctx.lineTo(-58, 5);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(58, 5);
            ctx.lineTo(65, 12 + flameLen);
            ctx.lineTo(62, 5);
            ctx.fill();

            ctx.restore();
        };

        const handleResize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const w = window.innerWidth;
            const h = window.innerHeight;

            canvas.width = w * dpr;
            canvas.height = h * dpr;

            ctx.scale(dpr, dpr);

            stateRef.current.width = w;
            stateRef.current.height = h;

            drawStaticCity(w, h);
        };

        const handlePointerMove = (e: PointerEvent) => {
            const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
            stateRef.current.steerX = Math.max(-1, Math.min(1, normalizedX));
        };

        const handlePointerDown = () => {
            stateRef.current.targetSpeed = 24;
            stateRef.current.isTurbo = true;
        };

        const handlePointerUp = () => {
            stateRef.current.targetSpeed = 12;
            stateRef.current.isTurbo = false;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);

        handleResize();
        renderLoop();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            cancelAnimationFrame(animationId);
        };
    }, [canvasRef]);
};