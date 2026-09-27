"use client";

import { useEffect, useRef, useCallback } from 'react';
import { GalaxyConfig, BlackHoleBody, StarParticle } from '../_utils/types';

export const useGalaxySimulation = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
    config: GalaxyConfig
) => {
    const configRef = useRef(config);
    const requestRef = useRef<number>(0);

    const blackHolesRef = useRef<BlackHoleBody[]>([]);
    const starsRef = useRef<StarParticle[]>([]);

    const cameraRef = useRef({
        rotX: 0.45,
        rotY: 0.25,
        targetRotX: 0.45,
        targetRotY: 0.25,
        zoom: 1.0,
        targetZoom: 1.0,
        isDragging: false,
        lastMouseX: 0,
        lastMouseY: 0,
    });

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const buildGalaxies = useCallback((preset: GalaxyConfig['preset']) => {
        const cfg = configRef.current;
        const totalStars = cfg.starCount;

        const bhs: BlackHoleBody[] = [];
        const stars: StarParticle[] = [];

        const G = 1.0;

        // Helper to spawn a spiral disc of stars around a black hole
        const createDisc = (
            bh: BlackHoleBody,
            count: number,
            galaxyId: number,
            radiusMin: number,
            radiusMax: number,
            tiltX: number,
            tiltY: number
        ) => {
            const cosTx = Math.cos(tiltX);
            const sinTx = Math.sin(tiltX);
            const cosTy = Math.cos(tiltY);
            const sinTy = Math.sin(tiltY);

            for (let i = 0; i < count; i++) {
                // Exponential disc density profile
                const u = Math.random();
                const r = radiusMin + Math.sqrt(u) * (radiusMax - radiusMin);
                const theta = Math.random() * Math.PI * 2;

                // Flat disc plane coordinates (dx, dy, 0)
                const lx = Math.cos(theta) * r;
                const ly = Math.sin(theta) * r;
                const lz = (Math.random() - 0.5) * (r * 0.08); // slight disc thickness

                // Rotate disc by inclination angles
                // Rotate Y
                const rx1 = lx * cosTy - lz * sinTy;
                const rz1 = lx * sinTy + lz * cosTy;
                // Rotate X
                const ryFinal = ly * cosTx - rz1 * sinTx;
                const rzFinal = ly * sinTx + rz1 * cosTx;
                const rxFinal = rx1;

                // Circular orbital velocity v = sqrt(G * (M_bh + M_halo(r)) / r)
                const haloFactor = cfg.darkMatterHalo * 0.4;
                const vMag = Math.sqrt((G * (bh.mass * (1 + haloFactor * (r / radiusMax)))) / Math.max(r, 8.0));

                // Tangent vector in local flat plane: (-sin theta, cos theta, 0)
                const lvx = -Math.sin(theta) * vMag;
                const lvy = Math.cos(theta) * vMag;
                const lvz = 0;

                // Rotate velocity vectors
                const rvx1 = lvx * cosTy - lvz * sinTy;
                const rvz1 = lvx * sinTy + lvz * cosTy;
                const rvyFinal = lvy * cosTx - rvz1 * sinTx;
                const rvzFinal = lvy * sinTx + rvz1 * cosTx;
                const rvxFinal = rvx1;

                stars.push({
                    x: bh.x + rxFinal,
                    y: bh.y + ryFinal,
                    z: bh.z + rzFinal,
                    vx: bh.vx + rvxFinal,
                    vy: bh.vy + rvyFinal,
                    vz: bh.vz + rvzFinal,
                    galaxyId,
                    mass: 0.1,
                    size: 1.0 + Math.random() * 1.5,
                    brightness: 0.5 + Math.random() * 0.5,
                    prevX: -1,
                    prevY: -1,
                });
            }
        };

        if (preset === 'mice') {
            // NGC 4676 "The Mice": Grazing parabolic collision
            const bh1: BlackHoleBody = {
                id: 'bh1',
                mass: 14000,
                x: -240,
                y: -90,
                z: -30,
                vx: 0.62,
                vy: 0.44,
                vz: 0.12,
                radius: 12,
                color: '#38bdf8',
            };
            const bh2: BlackHoleBody = {
                id: 'bh2',
                mass: 10000,
                x: 240,
                y: 90,
                z: 30,
                vx: -0.62,
                vy: -0.44,
                vz: -0.12,
                radius: 10,
                color: '#fbbf24',
            };
            bhs.push(bh1, bh2);

            const count1 = Math.floor(totalStars * 0.58);
            const count2 = totalStars - count1;
            createDisc(bh1, count1, 0, 15, 170, 0.35, 0.2);
            createDisc(bh2, count2, 1, 12, 140, -0.65, -0.4);
        } else if (preset === 'head-on') {
            // Cartwheel Head-On collision
            const bh1: BlackHoleBody = {
                id: 'bh1',
                mass: 18000,
                x: 0,
                y: 0,
                z: -260,
                vx: 0,
                vy: 0,
                vz: 0.65,
                radius: 14,
                color: '#38bdf8',
            };
            const bh2: BlackHoleBody = {
                id: 'bh2',
                mass: 8000,
                x: 20,
                y: 15,
                z: 260,
                vx: -0.05,
                vy: -0.05,
                vz: -0.95,
                radius: 9,
                color: '#f43f5e',
            };
            bhs.push(bh1, bh2);

            const count1 = Math.floor(totalStars * 0.72);
            const count2 = totalStars - count1;
            createDisc(bh1, count1, 0, 18, 190, 0.1, 0.0);
            createDisc(bh2, count2, 1, 10, 80, 0.5, 0.5);
        } else if (preset === 'cannibal') {
            // Giant Elliptical swallowing dwarf galaxy
            const bh1: BlackHoleBody = {
                id: 'bh1',
                mass: 25000,
                x: -70,
                y: 0,
                z: 0,
                vx: 0.15,
                vy: 0.1,
                vz: 0,
                radius: 16,
                color: '#a855f7',
            };
            const bh2: BlackHoleBody = {
                id: 'bh2',
                mass: 3500,
                x: 280,
                y: 110,
                z: 60,
                vx: -0.9,
                vy: -0.5,
                vz: -0.2,
                radius: 7,
                color: '#34d399',
            };
            bhs.push(bh1, bh2);

            const count1 = Math.floor(totalStars * 0.78);
            const count2 = totalStars - count1;
            createDisc(bh1, count1, 0, 20, 220, 0.1, 0.1);
            createDisc(bh2, count2, 1, 8, 70, 0.8, -0.6);
        } else if (preset === 'single') {
            // Stable Milky Way
            const bh1: BlackHoleBody = {
                id: 'bh1',
                mass: 22000,
                x: 0,
                y: 0,
                z: 0,
                vx: 0,
                vy: 0,
                vz: 0,
                radius: 15,
                color: '#38bdf8',
            };
            bhs.push(bh1);
            createDisc(bh1, totalStars, 0, 15, 230, 0.3, 0.2);
        } else {
            // Triple chaotic merger
            const bh1: BlackHoleBody = {
                id: 'bh1',
                mass: 12000,
                x: -160,
                y: -90,
                z: 0,
                vx: 0.4,
                vy: 0.6,
                vz: 0.1,
                radius: 11,
                color: '#38bdf8',
            };
            const bh2: BlackHoleBody = {
                id: 'bh2',
                mass: 10000,
                x: 170,
                y: -80,
                z: -40,
                vx: -0.55,
                vy: 0.35,
                vz: -0.15,
                radius: 10,
                color: '#fbbf24',
            };
            const bh3: BlackHoleBody = {
                id: 'bh3',
                mass: 9000,
                x: 0,
                y: 190,
                z: 40,
                vx: 0.15,
                vy: -0.85,
                vz: 0.05,
                radius: 9,
                color: '#ec4899',
            };
            bhs.push(bh1, bh2, bh3);

            const c = Math.floor(totalStars / 3);
            createDisc(bh1, c, 0, 12, 130, 0.2, 0.2);
            createDisc(bh2, c, 1, 12, 130, -0.4, -0.3);
            createDisc(bh3, totalStars - c * 2, 2, 10, 120, 0.6, 0.1);
        }

        blackHolesRef.current = bhs;
        starsRef.current = stars;
    }, []);

    const reset = useCallback(() => {
        buildGalaxies(configRef.current.preset);
        cameraRef.current.targetRotX = 0.45;
        cameraRef.current.targetRotY = 0.25;
        cameraRef.current.targetZoom = 1.0;
    }, [buildGalaxies]);

    // Launch a rogue black hole to disrupt the system
    const launchRogueBlackHole = useCallback(() => {
        const cam = cameraRef.current;
        const cosY = Math.cos(cam.rotY);
        const sinY = Math.sin(cam.rotY);

        const newBh: BlackHoleBody = {
            id: `rogue-${Date.now()}`,
            mass: 15000,
            x: -cosY * 350,
            y: (Math.random() - 0.5) * 80,
            z: -sinY * 350,
            vx: cosY * 1.5,
            vy: (Math.random() - 0.5) * 0.4,
            vz: sinY * 1.5,
            radius: 12,
            color: '#ef4444',
        };
        blackHolesRef.current.push(newBh);
    }, []);

    useEffect(() => {
        buildGalaxies(config.preset);
    }, [config.preset, buildGalaxies]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.scale(dpr, dpr);
        };

        const render = () => {
            const cfg = configRef.current;
            const bhs = blackHolesRef.current;
            const stars = starsRef.current;
            const cam = cameraRef.current;

            // Camera inertia smoothing
            cam.rotX += (cam.targetRotX - cam.rotX) * 0.1;
            cam.rotY += (cam.targetRotY - cam.rotY) * 0.1;
            cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;

            const dt = 0.5 * cfg.timeStep;
            const epsSq = cfg.softening * cfg.softening;
            const G = cfg.gravityConstant;

            // 1. Symplectic Leapfrog Integration: Black Holes
            // Mutual BH gravitational acceleration
            const bhAcc: { ax: number; ay: number; az: number }[] = bhs.map(() => ({ ax: 0, ay: 0, az: 0 }));

            for (let i = 0; i < bhs.length; i++) {
                for (let j = i + 1; j < bhs.length; j++) {
                    const dx = bhs[j].x - bhs[i].x;
                    const dy = bhs[j].y - bhs[i].y;
                    const dz = bhs[j].z - bhs[i].z;
                    const distSq = dx * dx + dy * dy + dz * dz + 400; // bh softening
                    const dist = Math.sqrt(distSq);
                    const invDist3 = 1.0 / (distSq * dist);

                    const f_ij = G * invDist3;
                    bhAcc[i].ax += f_ij * bhs[j].mass * dx;
                    bhAcc[i].ay += f_ij * bhs[j].mass * dy;
                    bhAcc[i].az += f_ij * bhs[j].mass * dz;

                    bhAcc[j].ax -= f_ij * bhs[i].mass * dx;
                    bhAcc[j].ay -= f_ij * bhs[i].mass * dy;
                    bhAcc[j].az -= f_ij * bhs[i].mass * dz;
                }
            }

            // Update BH velocity and position
            for (let i = 0; i < bhs.length; i++) {
                bhs[i].vx += bhAcc[i].ax * dt;
                bhs[i].vy += bhAcc[i].ay * dt;
                bhs[i].vz += bhAcc[i].az * dt;

                bhs[i].x += bhs[i].vx * dt;
                bhs[i].y += bhs[i].vy * dt;
                bhs[i].z += bhs[i].vz * dt;
            }

            // 2. Stars Gravitational Integration
            const haloGain = cfg.darkMatterHalo;

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                let ax = 0;
                let ay = 0;
                let az = 0;

                for (let j = 0; j < bhs.length; j++) {
                    const bh = bhs[j];
                    const dx = bh.x - s.x;
                    const dy = bh.y - s.y;
                    const dz = bh.z - s.z;
                    const distSq = dx * dx + dy * dy + dz * dz + epsSq;
                    const dist = Math.sqrt(distSq);
                    const invDist3 = 1.0 / (distSq * dist);

                    // Plummer gravitational acceleration
                    const force = G * bh.mass * invDist3 * (1 + haloGain * 0.15);
                    ax += dx * force;
                    ay += dy * force;
                    az += dz * force;
                }

                s.vx += ax * dt;
                s.vy += ay * dt;
                s.vz += az * dt;

                s.x += s.vx * dt;
                s.y += s.vy * dt;
                s.z += s.vz * dt;
            }

            // 3. Clear canvas with slight persistence for motion blur
            ctx.fillStyle = cfg.showVelocityTrails ? 'rgba(2, 6, 23, 0.35)' : 'rgba(2, 6, 23, 1.0)';
            ctx.fillRect(0, 0, width, height);

            // 4. 3D Camera Projection
            const cosY = Math.cos(cam.rotY);
            const sinY = Math.sin(cam.rotY);
            const cosX = Math.cos(cam.rotX);
            const sinX = Math.sin(cam.rotX);

            const cx = width * 0.5;
            const cy = height * 0.5;
            const fov = 750;
            const camDist = 950;
            const scale = 1.6 * cam.zoom;

            // Render Stars
            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];

                // 3D rotation
                const x1 = s.x * cosY - s.z * sinY;
                const z1 = s.x * sinY + s.z * cosY;
                const y1 = s.y * cosX - z1 * sinX;
                const zFinal = s.y * sinX + z1 * cosX;

                const zFactor = fov / (camDist - zFinal * scale * 0.6);
                if (zFactor <= 0) continue;

                const sx = cx + x1 * scale * zFactor;
                const sy = cy - y1 * scale * zFactor;

                // Color by galaxy origin and velocity
                let starColor = '';
                if (s.galaxyId === 0) {
                    starColor = 'rgba(56, 189, 248, '; // cyan blue
                } else if (s.galaxyId === 1) {
                    starColor = 'rgba(251, 191, 36, '; // gold amber
                } else {
                    starColor = 'rgba(244, 63, 94, ';  // rose pink
                }

                const alpha = Math.min(1.0, s.brightness * zFactor);
                ctx.fillStyle = `${starColor}${alpha.toFixed(2)})`;

                if (cfg.showVelocityTrails && s.prevX > 0) {
                    ctx.strokeStyle = `${starColor}${(alpha * 0.5).toFixed(2)})`;
                    ctx.lineWidth = s.size * zFactor;
                    ctx.beginPath();
                    ctx.moveTo(s.prevX, s.prevY);
                    ctx.lineTo(sx, sy);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(sx, sy, Math.max(0.7, s.size * zFactor * 0.8), 0, Math.PI * 2);
                    ctx.fill();
                }

                s.prevX = sx;
                s.prevY = sy;
            }

            ctx.restore();

            // 5. Render Black Holes
            for (let i = 0; i < bhs.length; i++) {
                const bh = bhs[i];

                const x1 = bh.x * cosY - bh.z * sinY;
                const z1 = bh.x * sinY + bh.z * cosY;
                const y1 = bh.y * cosX - z1 * sinX;
                const zFinal = bh.y * sinX + z1 * cosX;

                const zFactor = fov / (camDist - zFinal * scale * 0.6);
                if (zFactor <= 0) continue;

                const sx = cx + x1 * scale * zFactor;
                const sy = cy - y1 * scale * zFactor;
                const r = Math.max(4, bh.radius * scale * zFactor * 0.5);

                // Gravitational Accretion Glow Halo
                ctx.save();
                ctx.beginPath();
                ctx.arc(sx, sy, r * 3.5, 0, Math.PI * 2);
                ctx.fillStyle = `${bh.color}33`;
                ctx.fill();

                // Accretion Ring
                ctx.beginPath();
                ctx.arc(sx, sy, r * 1.8, 0, Math.PI * 2);
                ctx.fillStyle = `${bh.color}88`;
                ctx.shadowColor = bh.color;
                ctx.shadowBlur = 24;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Event Horizon Shadow (Black Hole Center)
                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.restore();
            }

            // Camera subtle auto orbit
            if (!cam.isDragging) {
                cam.targetRotY += 0.0018;
            }

            requestRef.current = requestAnimationFrame(render);
        };

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const isTouch = 'touches' in e;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;

            cameraRef.current.isDragging = true;
            cameraRef.current.lastMouseX = clientX;
            cameraRef.current.lastMouseY = clientY;
        };

        const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            if (!cameraRef.current.isDragging) return;
            const isTouch = 'touches' in e;
            if (isTouch && (!e.touches || e.touches.length === 0)) return;
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;

            const dx = clientX - cameraRef.current.lastMouseX;
            const dy = clientY - cameraRef.current.lastMouseY;
            cameraRef.current.lastMouseX = clientX;
            cameraRef.current.lastMouseY = clientY;

            cameraRef.current.targetRotY += dx * 0.007;
            cameraRef.current.targetRotX += dy * 0.007;
            cameraRef.current.targetRotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, cameraRef.current.targetRotX));
        };

        const handlePointerUp = () => {
            cameraRef.current.isDragging = false;
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            cameraRef.current.targetZoom = Math.max(0.3, Math.min(3.5, cameraRef.current.targetZoom * delta));
        };

        resize();
        render();

        window.addEventListener('resize', resize);
        canvas.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchmove', handlePointerMove, { passive: true });
        window.addEventListener('touchend', handlePointerUp, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            canvas.removeEventListener('wheel', handleWheel);

            canvas.removeEventListener('touchstart', handlePointerDown);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [canvasRef, containerRef]);

    return { reset, launchRogueBlackHole };
};
