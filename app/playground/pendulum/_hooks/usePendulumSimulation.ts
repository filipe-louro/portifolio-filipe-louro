"use client";

import { useEffect, useRef, useCallback } from 'react';
import { PendulumConfig } from '../_utils/types';

interface DoubleState {
    theta1: number;
    omega1: number;
    theta2: number;
    omega2: number;
    color: string;
    prevX2: number;
    prevY2: number;
}

interface TripleState {
    theta1: number;
    omega1: number;
    theta2: number;
    omega2: number;
    theta3: number;
    omega3: number;
    prevX3: number;
    prevY3: number;
}

const LYAPUNOV_COUNT = 36;

export const usePendulumSimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: PendulumConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    const pivotRef = useRef<{ x: number; y: number; defaultX: number; defaultY: number }>({
        x: 0,
        y: 0,
        defaultX: 0,
        defaultY: 0,
    });

    const isDraggingPivotRef = useRef(false);
    const isDraggingBob1Ref = useRef(false);
    const isDraggingBob2Ref = useRef(false);
    const isDraggingBob3Ref = useRef(false);

    // Estado dos pêndulos
    const doubleInstancesRef = useRef<DoubleState[]>([]);
    const tripleStateRef = useRef<TripleState>({
        theta1: Math.PI / 2,
        omega1: 0,
        theta2: Math.PI / 2,
        omega2: 0,
        theta3: Math.PI / 2,
        omega3: 0,
        prevX3: 0,
        prevY3: 0,
    });

    // Canvas de rastro persistente (para glow fosforescente suave)
    const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Histórico para plot do espaço de fase
    const phaseHistoryRef = useRef<{ theta: number; omega: number }[]>([]);

    const mouseRef = useRef<{ x: number; y: number; isDown: boolean }>({
        x: -1000,
        y: -1000,
        isDown: false,
    });

    const initPendulums = useCallback((mode: string) => {
        const instances: DoubleState[] = [];
        const baseTheta1 = Math.PI * 0.55;
        const baseTheta2 = Math.PI * 0.65;

        if (mode === 'lyapunov') {
            for (let i = 0; i < LYAPUNOV_COUNT; i++) {
                const perturb = i * 0.00008;
                // Gradiente cromático do feixe
                const hue = 190 + (i / LYAPUNOV_COUNT) * 150;
                instances.push({
                    theta1: baseTheta1,
                    omega1: 0,
                    theta2: baseTheta2 + perturb,
                    omega2: 0,
                    color: `hsla(${hue}, 95%, 65%, 0.65)`,
                    prevX2: 0,
                    prevY2: 0,
                });
            }
        } else {
            instances.push({
                theta1: baseTheta1,
                omega1: 0,
                theta2: baseTheta2,
                omega2: 0,
                color: 'rgba(56, 189, 248, 0.9)', // sky-400
                prevX2: 0,
                prevY2: 0,
            });
        }

        doubleInstancesRef.current = instances;
        tripleStateRef.current = {
            theta1: Math.PI * 0.6,
            omega1: 0,
            theta2: Math.PI * 0.6,
            omega2: 0,
            theta3: Math.PI * 0.5,
            omega3: 0,
            prevX3: 0,
            prevY3: 0,
        };

        phaseHistoryRef.current = [];

        // Limpar rastro ao reiniciar
        if (trailCanvasRef.current) {
            const tctx = trailCanvasRef.current.getContext('2d');
            if (tctx) {
                tctx.fillStyle = '#020617';
                tctx.fillRect(0, 0, trailCanvasRef.current.width, trailCanvasRef.current.height);
            }
        }
    }, []);

    useEffect(() => {
        const prevMode = configRef.current.mode;
        configRef.current = config;

        if (config.mode !== prevMode) {
            initPendulums(config.mode);
        }
    }, [config, initPendulums]);

    const reset = useCallback(() => {
        initPendulums(configRef.current.mode);
    }, [initPendulums]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let trailCanvas = trailCanvasRef.current;
        if (!trailCanvas) {
            trailCanvas = document.createElement('canvas');
            trailCanvasRef.current = trailCanvas;
        }
        const trailCtx = trailCanvas.getContext('2d');

        let w = 0, h = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = container.clientWidth;
            h = container.clientHeight;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);

            if (trailCanvas && trailCtx) {
                trailCanvas.width = w * dpr;
                trailCanvas.height = h * dpr;
                trailCtx.fillStyle = '#020617';
                trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height);
            }

            pivotRef.current = {
                x: w * 0.5,
                y: Math.max(90, h * 0.35),
                defaultX: w * 0.5,
                defaultY: Math.max(90, h * 0.35),
            };

            if (doubleInstancesRef.current.length === 0) {
                initPendulums(configRef.current.mode);
            }
        };

        // Derivadas do pêndulo duplo
        const getDoubleDerivatives = (
            th1: number,
            om1: number,
            th2: number,
            om2: number,
            l1: number,
            l2: number,
            m1: number,
            m2: number,
            g: number,
            damp: number
        ) => {
            const delta = th1 - th2;
            const denom = 2 * m1 + m2 - m2 * Math.cos(2 * delta);

            const num1 =
                -g * (2 * m1 + m2) * Math.sin(th1) -
                m2 * g * Math.sin(th1 - 2 * th2) -
                2 * Math.sin(delta) * m2 * (om2 * om2 * l2 + om1 * om1 * l1 * Math.cos(delta));

            const alpha1 = num1 / (l1 * denom) - damp * om1;

            const num2 =
                2 *
                Math.sin(delta) *
                (om1 * om1 * l1 * (m1 + m2) +
                    g * (m1 + m2) * Math.cos(th1) +
                    om2 * om2 * l2 * m2 * Math.cos(delta));

            const alpha2 = num2 / (l2 * denom) - damp * om2;

            return { dTh1: om1, dOm1: alpha1, dTh2: om2, dOm2: alpha2 };
        };

        // Integração Runge-Kutta 4ª ordem (RK4)
        const stepRK4 = (
            st: DoubleState,
            dt: number,
            l1: number,
            l2: number,
            m1: number,
            m2: number,
            g: number,
            damp: number
        ) => {
            const k1 = getDoubleDerivatives(st.theta1, st.omega1, st.theta2, st.omega2, l1, l2, m1, m2, g, damp);

            const k2 = getDoubleDerivatives(
                st.theta1 + 0.5 * dt * k1.dTh1,
                st.omega1 + 0.5 * dt * k1.dOm1,
                st.theta2 + 0.5 * dt * k1.dTh2,
                st.omega2 + 0.5 * dt * k1.dOm2,
                l1,
                l2,
                m1,
                m2,
                g,
                damp
            );

            const k3 = getDoubleDerivatives(
                st.theta1 + 0.5 * dt * k2.dTh1,
                st.omega1 + 0.5 * dt * k2.dOm1,
                st.theta2 + 0.5 * dt * k2.dTh2,
                st.omega2 + 0.5 * dt * k2.dOm2,
                l1,
                l2,
                m1,
                m2,
                g,
                damp
            );

            const k4 = getDoubleDerivatives(
                st.theta1 + dt * k3.dTh1,
                st.omega1 + dt * k3.dOm1,
                st.theta2 + dt * k3.dTh2,
                st.omega2 + dt * k3.dOm2,
                l1,
                l2,
                m1,
                m2,
                g,
                damp
            );

            st.theta1 += (dt / 6) * (k1.dTh1 + 2 * k2.dTh1 + 2 * k3.dTh1 + k4.dTh1);
            st.omega1 += (dt / 6) * (k1.dOm1 + 2 * k2.dOm1 + 2 * k3.dOm1 + k4.dOm1);
            st.theta2 += (dt / 6) * (k1.dTh2 + 2 * k2.dTh2 + 2 * k3.dTh2 + k4.dTh2);
            st.omega2 += (dt / 6) * (k1.dOm2 + 2 * k2.dOm2 + 2 * k3.dOm2 + k4.dOm2);
        };

        const render = () => {
            const { gravity, length1, length2, length3, mass1, mass2, damping, trailPersistence, mode, isPaused, showPhaseSpace } =
                configRef.current;
            const pivot = pivotRef.current;
            const mouse = mouseRef.current;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

            // Escala de gravidade
            const g = gravity * 0.8;

            // Retorno elástico suave do pivô se não estiver sendo arrastado
            if (!isDraggingPivotRef.current) {
                pivot.x += (pivot.defaultX - pivot.x) * 0.08;
                pivot.y += (pivot.defaultY - pivot.y) * 0.08;
            }

            // Arrastar com ponteiro
            if (isDraggingPivotRef.current) {
                pivot.x = mouse.x;
                pivot.y = mouse.y;
            } else if (mode === 'triple') {
                const st = tripleStateRef.current;
                if (isDraggingBob1Ref.current) {
                    const dx = mouse.x - pivot.x;
                    const dy = mouse.y - pivot.y;
                    st.theta1 = Math.atan2(dx, dy);
                    st.omega1 = 0;
                } else if (isDraggingBob2Ref.current) {
                    const x1 = pivot.x + length1 * Math.sin(st.theta1);
                    const y1 = pivot.y + length1 * Math.cos(st.theta1);
                    const dx = mouse.x - x1;
                    const dy = mouse.y - y1;
                    st.theta2 = Math.atan2(dx, dy);
                    st.omega2 = 0;
                } else if (isDraggingBob3Ref.current) {
                    const x1 = pivot.x + length1 * Math.sin(st.theta1);
                    const y1 = pivot.y + length1 * Math.cos(st.theta1);
                    const x2 = x1 + length2 * Math.sin(st.theta2);
                    const y2 = y1 + length2 * Math.cos(st.theta2);
                    const dx = mouse.x - x2;
                    const dy = mouse.y - y2;
                    st.theta3 = Math.atan2(dx, dy);
                    st.omega3 = 0;
                }
            } else if (isDraggingBob1Ref.current && doubleInstancesRef.current.length > 0) {
                const dx = mouse.x - pivot.x;
                const dy = mouse.y - pivot.y;
                const angle = Math.atan2(dx, dy);
                for (let i = 0; i < doubleInstancesRef.current.length; i++) {
                    doubleInstancesRef.current[i].theta1 = angle;
                    doubleInstancesRef.current[i].omega1 = 0;
                }
            } else if (isDraggingBob2Ref.current && doubleInstancesRef.current.length > 0) {
                const lead = doubleInstancesRef.current[0];
                const x1 = pivot.x + length1 * Math.sin(lead.theta1);
                const y1 = pivot.y + length1 * Math.cos(lead.theta1);
                const dx = mouse.x - x1;
                const dy = mouse.y - y1;
                const angle = Math.atan2(dx, dy);
                for (let i = 0; i < doubleInstancesRef.current.length; i++) {
                    const offset = i * 0.00008;
                    doubleInstancesRef.current[i].theta2 = angle + (mode === 'lyapunov' ? offset : 0);
                    doubleInstancesRef.current[i].omega2 = 0;
                }
            }

            // Simulação física sub-dividida para precisão e conservação de energia
            const subSteps = isPaused ? 0 : 8;
            const dt = 0.02 / 8;

            if (trailCtx && trailCanvas) {
                // Esmorecimento do rastro (fade) apenas quando não pausado
                if (!isPaused) {
                    trailCtx.save();
                    trailCtx.scale(dpr, dpr);
                    trailCtx.fillStyle = `rgba(2, 6, 23, ${1 - trailPersistence})`;
                    trailCtx.fillRect(0, 0, w, h);
                    trailCtx.restore();
                }

                trailCtx.save();
                trailCtx.scale(dpr, dpr);

                if (mode === 'triple') {
                    const st = tripleStateRef.current;
                    for (let step = 0; step < subSteps; step++) {
                        // Aproximação do pêndulo triplo acoplado
                        const k1 = getDoubleDerivatives(st.theta1, st.omega1, st.theta2, st.omega2, length1, length2, mass1, mass2, g, damping);
                        const k2 = getDoubleDerivatives(st.theta2, st.omega2, st.theta3, st.omega3, length2, length3, mass2, configRef.current.mass3, g, damping);

                        st.theta1 += st.omega1 * dt;
                        st.omega1 += k1.dOm1 * dt;
                        st.theta2 += st.omega2 * dt;
                        st.omega2 += (k1.dOm2 + k2.dOm1 * 0.5) * dt;
                        st.theta3 += st.omega3 * dt;
                        st.omega3 += k2.dOm2 * dt;
                    }

                    const x1 = pivot.x + length1 * Math.sin(st.theta1);
                    const y1 = pivot.y + length1 * Math.cos(st.theta1);
                    const x2 = x1 + length2 * Math.sin(st.theta2);
                    const y2 = y1 + length2 * Math.cos(st.theta2);
                    const x3 = x2 + length3 * Math.sin(st.theta3);
                    const y3 = y2 + length3 * Math.cos(st.theta3);

                    if (st.prevX3 > 0) {
                        trailCtx.beginPath();
                        trailCtx.moveTo(st.prevX3, st.prevY3);
                        trailCtx.lineTo(x3, y3);
                        trailCtx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
                        trailCtx.lineWidth = 1.8;
                        trailCtx.stroke();
                    }
                    st.prevX3 = x3;
                    st.prevY3 = y3;
                } else {
                    const instances = doubleInstancesRef.current;
                    for (let step = 0; step < subSteps; step++) {
                        for (let i = 0; i < instances.length; i++) {
                            stepRK4(instances[i], dt, length1, length2, mass1, mass2, g, damping);
                        }
                    }

                    trailCtx.lineWidth = mode === 'lyapunov' ? 1.4 : 2.2;
                    for (let i = 0; i < instances.length; i++) {
                        const st = instances[i];
                        const x1 = pivot.x + length1 * Math.sin(st.theta1);
                        const y1 = pivot.y + length1 * Math.cos(st.theta1);
                        const x2 = x1 + length2 * Math.sin(st.theta2);
                        const y2 = y1 + length2 * Math.cos(st.theta2);

                        if (st.prevX2 > 0) {
                            trailCtx.beginPath();
                            trailCtx.moveTo(st.prevX2, st.prevY2);
                            trailCtx.lineTo(x2, y2);
                            trailCtx.strokeStyle = st.color;
                            trailCtx.stroke();
                        }
                        st.prevX2 = x2;
                        st.prevY2 = y2;
                    }

                    // Gravar histórico para o espaço de fase do pêndulo principal
                    if (instances.length > 0 && !isPaused) {
                        const lead = instances[0];
                        phaseHistoryRef.current.push({ theta: lead.theta1, omega: lead.omega1 });
                        if (phaseHistoryRef.current.length > 250) {
                            phaseHistoryRef.current.shift();
                        }
                    }
                }
                trailCtx.restore();
            }

            // RENDERIZAÇÃO DA CENA PRINCIPAL
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);

            // Desenhar rastro acumulado
            if (trailCanvas) {
                ctx.save();
                ctx.drawImage(trailCanvas, 0, 0, w, h);
                ctx.restore();
            }

            // Desenhar hastes e massas
            if (mode === 'triple') {
                const st = tripleStateRef.current;
                const x1 = pivot.x + length1 * Math.sin(st.theta1);
                const y1 = pivot.y + length1 * Math.cos(st.theta1);
                const x2 = x1 + length2 * Math.sin(st.theta2);
                const y2 = y1 + length2 * Math.cos(st.theta2);
                const x3 = x2 + length3 * Math.sin(st.theta3);
                const y3 = y2 + length3 * Math.cos(st.theta3);

                // Linhas
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.beginPath();
                ctx.moveTo(pivot.x, pivot.y);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y3);
                ctx.stroke();

                // Bobs
                ctx.fillStyle = '#38bdf8';
                [
                    { x: x1, y: y1, r: 8 },
                    { x: x2, y: y2, r: 7 },
                    { x: x3, y: y3, r: 6 },
                ].forEach((b) => {
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else {
                const instances = doubleInstancesRef.current;

                if (mode === 'lyapunov') {
                    // No modo Lyapunov, desenhamos as hastes do feixe com opacidade suave
                    ctx.lineWidth = 1;
                    for (let i = 0; i < instances.length; i += 2) {
                        const st = instances[i];
                        const x1 = pivot.x + length1 * Math.sin(st.theta1);
                        const y1 = pivot.y + length1 * Math.cos(st.theta1);
                        const x2 = x1 + length2 * Math.sin(st.theta2);
                        const y2 = y1 + length2 * Math.cos(st.theta2);

                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                        ctx.beginPath();
                        ctx.moveTo(pivot.x, pivot.y);
                        ctx.lineTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();

                        ctx.fillStyle = st.color;
                        ctx.beginPath();
                        ctx.arc(x2, y2, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Desenhar pêndulo guia principal com destaque nítido
                if (instances.length > 0) {
                    const lead = instances[0];
                    const x1 = pivot.x + length1 * Math.sin(lead.theta1);
                    const y1 = pivot.y + length1 * Math.cos(lead.theta1);
                    const x2 = x1 + length2 * Math.sin(lead.theta2);
                    const y2 = y1 + length2 * Math.cos(lead.theta2);

                    // Haste 1
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
                    ctx.beginPath();
                    ctx.moveTo(pivot.x, pivot.y);
                    ctx.lineTo(x1, y1);
                    ctx.stroke();

                    // Haste 2
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();

                    // Massa 1
                    ctx.beginPath();
                    ctx.arc(x1, y1, Math.max(7, mass1 * 0.9), 0, Math.PI * 2);
                    ctx.fillStyle = '#bae6fd';
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#0284c7';
                    ctx.stroke();

                    // Massa 2
                    ctx.beginPath();
                    ctx.arc(x2, y2, Math.max(6, mass2 * 0.85), 0, Math.PI * 2);
                    ctx.fillStyle = '#38bdf8';
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#0369a1';
                    ctx.stroke();
                }
            }

            // Desenhar Pivô (com base tecnológica e iluminação)
            ctx.beginPath();
            ctx.arc(pivot.x, pivot.y, 9, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = isDraggingPivotRef.current ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pivot.x, pivot.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();

            // Espaço de fase em miniatura (HUD científico no canto superior esquerdo ou inferior)
            if (showPhaseSpace && phaseHistoryRef.current.length > 2) {
                const boxW = 130;
                const boxH = 90;
                const boxX = 24;
                const boxY = Math.max(90, h * 0.18);

                ctx.save();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(boxX, boxY, boxW, boxH, 8);
                ctx.fill();
                ctx.stroke();

                // Eixos
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.moveTo(boxX + 10, boxY + boxH / 2);
                ctx.lineTo(boxX + boxW - 10, boxY + boxH / 2);
                ctx.moveTo(boxX + boxW / 2, boxY + 10);
                ctx.lineTo(boxX + boxW / 2, boxY + boxH - 10);
                ctx.stroke();

                // Rótulo
                ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
                ctx.font = '9px monospace';
                ctx.fillText('Fase (θ₁, ω₁)', boxX + 10, boxY + 14);

                // Traço do atrator
                const hist = phaseHistoryRef.current;
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                let prevNormTheta: number | null = null;
                for (let i = 0; i < hist.length; i++) {
                    const normTheta = (((hist[i].theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
                    const px = boxX + boxW / 2 + (normTheta / Math.PI) * (boxW * 0.4);
                    const py = boxY + boxH / 2 - Math.max(-1, Math.min(1, hist[i].omega / 15)) * (boxH * 0.38);

                    if (i === 0 || (prevNormTheta !== null && Math.abs(normTheta - prevNormTheta) > Math.PI)) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                    prevNormTheta = normTheta;
                }
                ctx.stroke();
                ctx.restore();
            }

            requestRef.current = requestAnimationFrame(render);
        };

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            if (isTouch && (!e.touches || e.touches.length === 0)) return;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            const rect = canvas.getBoundingClientRect();
            const posX = clientX - rect.left;
            const posY = clientY - rect.top;

            mouseRef.current.x = posX;
            mouseRef.current.y = posY;
            mouseRef.current.isDown = true;

            const pivot = pivotRef.current;
            const distPivotSq = (posX - pivot.x) ** 2 + (posY - pivot.y) ** 2;

            if (distPivotSq < 30 * 30) {
                isDraggingPivotRef.current = true;
                return;
            }

            const { length1, length2, length3, mode } = configRef.current;
            if (mode === 'triple') {
                const st = tripleStateRef.current;
                const x1 = pivot.x + length1 * Math.sin(st.theta1);
                const y1 = pivot.y + length1 * Math.cos(st.theta1);
                const x2 = x1 + length2 * Math.sin(st.theta2);
                const y2 = y1 + length2 * Math.cos(st.theta2);
                const x3 = x2 + length3 * Math.sin(st.theta3);
                const y3 = y2 + length3 * Math.cos(st.theta3);

                const d1Sq = (posX - x1) ** 2 + (posY - y1) ** 2;
                const d2Sq = (posX - x2) ** 2 + (posY - y2) ** 2;
                const d3Sq = (posX - x3) ** 2 + (posY - y3) ** 2;

                if (d3Sq < 35 * 35) {
                    isDraggingBob3Ref.current = true;
                } else if (d2Sq < 35 * 35) {
                    isDraggingBob2Ref.current = true;
                } else if (d1Sq < 35 * 35) {
                    isDraggingBob1Ref.current = true;
                }
            } else if (doubleInstancesRef.current.length > 0) {
                const lead = doubleInstancesRef.current[0];
                const x1 = pivot.x + length1 * Math.sin(lead.theta1);
                const y1 = pivot.y + length1 * Math.cos(lead.theta1);
                const x2 = x1 + length2 * Math.sin(lead.theta2);
                const y2 = y1 + length2 * Math.cos(lead.theta2);

                const d1Sq = (posX - x1) ** 2 + (posY - y1) ** 2;
                const d2Sq = (posX - x2) ** 2 + (posY - y2) ** 2;

                if (d2Sq < 35 * 35) {
                    isDraggingBob2Ref.current = true;
                } else if (d1Sq < 35 * 35) {
                    isDraggingBob1Ref.current = true;
                }
            }
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            if (isTouch && (!e.touches || e.touches.length === 0)) return;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = clientX - rect.left;
            mouseRef.current.y = clientY - rect.top;
        };

        const handlePointerUp = () => {
            mouseRef.current.isDown = false;
            isDraggingPivotRef.current = false;
            isDraggingBob1Ref.current = false;
            isDraggingBob2Ref.current = false;
            isDraggingBob3Ref.current = false;
        };

        resize();
        render();

        window.addEventListener('resize', resize);
        canvas.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);

        canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);

            canvas.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef, initPendulums]);

    return { reset };
};
