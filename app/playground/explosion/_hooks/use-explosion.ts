"use client";

import { useEffect, MutableRefObject, useRef } from 'react';

interface MouseState {
    x: number;
    y: number;
    radius: number;
    isActive: boolean;
}

class Particle {
    x: number; y: number; originX: number; originY: number; size: number;
    vx: number; vy: number; friction: number; ease: number; dx: number; dy: number;
    distance: number; force: number; angle: number;

    constructor(x: number, y: number, gap: number, canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.originX = x;
        this.originY = y;
        this.size = window.innerWidth < 768 ? gap - 0.5 : gap - 1;
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.92;
        this.ease = 0.12;
        this.dx = 0;
        this.dy = 0;
        this.distance = 0;
        this.force = 0;
        this.angle = 0;
    }

    update(mouse: MouseState) {
        this.dx = mouse.x - this.x;
        this.dy = mouse.y - this.y;
        this.distance = this.dx * this.dx + this.dy * this.dy;
        const currentForceRadius = mouse.isActive ? mouse.radius : 0;
        this.force = -mouse.radius * 80 / this.distance;
        if (this.distance < currentForceRadius * currentForceRadius) {
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }
        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

export const useExplosion = (
    canvasRef: MutableRefObject<HTMLCanvasElement | null>,
    text: string = "LOURO",
    color: string = "#ffffff"
) => {
    const mouseRef = useRef<MouseState>({ x: 0, y: 0, radius: 100, isActive: false });
    const animationRef = useRef<number>(0);

    // texto e cor vivem em refs para o efeito principal não ser recriado a cada
    // tecla/cor: o texto novo vira um "morph" (partículas voam para os novos
    // alvos) e a cor troca no frame seguinte, sem resetar a simulação
    const textRef = useRef(text);
    const colorRef = useRef(color);
    const initRef = useRef<() => void>(() => {});

    useEffect(() => {
        colorRef.current = color;
    }, [color]);

    useEffect(() => {
        textRef.current = text;
        initRef.current();
    }, [text]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationRunning = true;

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'white';
            const currentText = textRef.current || ' ';
            const fontSize = window.innerWidth < 768 ? 20 : 15;
            const dynamicFontSize = currentText.length > 6 ? fontSize * (6 / currentText.length) : fontSize;

            ctx.font = `bold ${dynamicFontSize}vw Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(currentText, canvas.width / 2, canvas.height / 2);

            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const gap = window.innerWidth < 768 ? 4 : 3;

            const targets: { x: number; y: number }[] = [];
            for (let y = 0; y < textCoordinates.height; y += gap) {
                for (let x = 0; x < textCoordinates.width; x += gap) {
                    if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                        targets.push({ x, y });
                    }
                }
            }

            // morph: partículas existentes recebem novos alvos e voam até eles;
            // as que faltam nascem espalhadas; as que sobram se fundem em alvos
            // aleatórios do texto novo (em vez de sumir num "pop")
            const size = window.innerWidth < 768 ? gap - 0.5 : gap - 1;
            const previous = particles;
            particles = [];

            for (let i = 0; i < targets.length; i++) {
                if (i < previous.length) {
                    const p = previous[i];
                    p.originX = targets[i].x;
                    p.originY = targets[i].y;
                    p.size = size;
                    particles.push(p);
                } else {
                    particles.push(new Particle(targets[i].x, targets[i].y, gap, canvas.width, canvas.height));
                }
            }
            if (targets.length > 0) {
                for (let i = targets.length; i < previous.length; i++) {
                    const p = previous[i];
                    const target = targets[Math.floor(Math.random() * targets.length)];
                    p.originX = target.x;
                    p.originY = target.y;
                    p.size = size;
                    particles.push(p);
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        initRef.current = init;

        const animate = () => {
            if (!animationRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = colorRef.current;
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(mouseRef.current);
                particles[i].draw(ctx);
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        // Garante que as fontes carregaram antes de inicializar
        document.fonts.ready.then(() => {
            if (!animationRunning) return;
            init();

            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            animate();
        });

        const handleInput = (x: number, y: number) => {
            const bounds = canvas.getBoundingClientRect();
            mouseRef.current.x = x - bounds.left;
            mouseRef.current.y = y - bounds.top;
            mouseRef.current.isActive = true;
        };

        const handleMove = (e: MouseEvent) => handleInput(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) handleInput(e.touches[0].clientX, e.touches[0].clientY);
        };
        const handleLeave = () => { mouseRef.current.isActive = false; };

        // Debounce: init() reescaneia todos os pixels do texto, caro demais
        // para rodar em cada evento de resize durante o arrasto da janela
        let resizeTimer = 0;
        const handleResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => initRef.current(), 150);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('resize', handleResize);
        window.addEventListener('mouseup', handleLeave);
        window.addEventListener('mouseleave', handleLeave);
        window.addEventListener('touchend', handleLeave);

        return () => {
            animationRunning = false;
            window.clearTimeout(resizeTimer);
            cancelAnimationFrame(animationRef.current);
            initRef.current = () => {};
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mouseup', handleLeave);
            window.removeEventListener('mouseleave', handleLeave);
            window.removeEventListener('touchend', handleLeave);
        };
    }, [canvasRef]);
};
