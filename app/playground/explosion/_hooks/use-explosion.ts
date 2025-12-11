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
    color: string;
    vx: number; vy: number; friction: number; ease: number; dx: number; dy: number;
    distance: number; force: number; angle: number;

    constructor(x: number, y: number, gap: number, canvasWidth: number, canvasHeight: number, color: string) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.originX = x;
        this.originY = y;
        this.size = window.innerWidth < 768 ? gap - 0.5 : gap - 1;
        this.color = color;
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
        ctx.fillStyle = this.color;
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationRunning = true; // Flag local para controlar o loop dentro deste efeito

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];

            // Limpa antes de desenhar o texto para leitura
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'white';
            const fontSize = window.innerWidth < 768 ? 20 : 15;
            const dynamicFontSize = text.length > 6 ? fontSize * (6 / text.length) : fontSize;

            // Define fonte genérica sans-serif como fallback
            ctx.font = `bold ${dynamicFontSize}vw Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const gap = window.innerWidth < 768 ? 4 : 3;

            for (let y = 0; y < textCoordinates.height; y += gap) {
                for (let x = 0; x < textCoordinates.width; x += gap) {
                    if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                        particles.push(new Particle(x, y, gap, canvas.width, canvas.height, color));
                    }
                }
            }
        };

        const animate = () => {
            if (!animationRunning) return; // Para se o componente desmontou ou mudou dependencies

            ctx.clearRect(0, 0, canvas.width, canvas.height);
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

            // CORREÇÃO: Cancela qualquer frame anterior pendente antes de iniciar um novo
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

        const handleResize = () => {
            init();
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('resize', handleResize);
        window.addEventListener('mouseup', handleLeave);
        window.addEventListener('mouseleave', handleLeave);
        window.addEventListener('touchend', handleLeave);

        return () => {
            animationRunning = false; // Mata o loop local
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mouseup', handleLeave);
            window.removeEventListener('mouseleave', handleLeave);
            window.removeEventListener('touchend', handleLeave);
        };
    }, [canvasRef, text, color]);
};