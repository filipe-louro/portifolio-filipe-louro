"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { RGBConfig, KeyRefData } from '../_utils/types';

export const useRGBAnimation = (
    config: RGBConfig,
    setConfig: React.Dispatch<React.SetStateAction<RGBConfig>>
) => {
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

    const keyRefs = useRef<Map<string, KeyRefData>>(new Map());
    const posCacheRef = useRef<Map<string, { x: number, y: number }>>(new Map());
    const needsLayoutRef = useRef(true);

    const requestRef = useRef<number>(0);
    const timeRef = useRef(0);
    const ripplesRef = useRef<{ key: string, x: number, y: number, time: number }[]>([]);

    const playClick = useCallback(() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(5);
    }, []);

    const animate = useCallback(() => {
        timeRef.current += config.speed * 0.5;
        const time = timeRef.current;
        const now = Date.now();
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;

        ripplesRef.current = ripplesRef.current.filter(r => now - r.time < 600);

        if (needsLayoutRef.current) {
            keyRefs.current.forEach(({ el, label }) => {
                const rect = el.getBoundingClientRect();
                posCacheRef.current.set(label, {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                });
            });
            needsLayoutRef.current = false;
        }

        keyRefs.current.forEach(({ el, label }) => {
            const pos = posCacheRef.current.get(label);
            if (!pos) return;

            const { x: centerX, y: centerY } = pos;
            let h = 0, s = 100, l = 50;

            if (config.mode === 'wave') {
                const spatial = config.direction === 'ltr' ? centerX * 0.5 : -centerX * 0.5;
                h = (time + spatial) % 360;
                l = 60;
            } else if (config.mode === 'breathing') {
                const wave = Math.sin(time * 0.05);
                h = config.primaryHue + (wave * 20);
                l = 40 + (wave * 20);
            } else if (config.mode === 'static') {
                if (config.staticType === 'gradient') {
                    const spatial = config.direction === 'ltr' ? centerX * 0.5 : -centerX * 0.5;
                    h = spatial % 360;
                    l = 60;
                } else {
                    h = config.primaryHue;
                    l = 50;
                }
            } else if (config.mode === 'scan') {
                const p = (Math.sin(time * 0.02) + 1) / 2 * screenW;
                const dist = Math.abs(centerX - p);
                const intensity = Math.max(0, 1 - dist / 150);
                h = config.primaryHue;
                l = intensity * 60;
            } else if (config.mode === 'reactive') {
                h = config.primaryHue;
                l = 5;
            }

            let rippleAdd = 0;
            const rLen = ripplesRef.current.length;
            for (let i = 0; i < rLen; i++) {
                const ripple = ripplesRef.current[i];
                const dx = centerX - ripple.x;
                const dy = centerY - ripple.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const age = now - ripple.time;
                const radius = age * 2.5;
                const intensity = Math.max(0, 1 - Math.abs(dist - radius) / 60) * (1 - age / 600);
                rippleAdd += intensity;
            }

            if (!config.isOn) {
                l = 0;
                rippleAdd = 0;
            }

            const finalL = Math.min(100, (l * (config.brightness / 100)) + (rippleAdd * 100));
            const finalS = Math.max(0, s - (rippleAdd * 100));
            const color = `hsl(${h}, ${finalS}%, ${finalL}%)`;

            if (el.style.borderColor !== color) el.style.borderColor = color;

            const txtColor = rippleAdd > 0.2 ? '#000' : color;
            if(el.style.color !== txtColor) el.style.color = txtColor;

            const isActive = activeKeys.has(label);
            const isLit = (config.mode !== 'reactive' || rippleAdd > 0 || isActive) && config.isOn;

            if (isLit) {
                el.style.boxShadow = isActive
                    ? `inset 0 2px 5px rgba(0,0,0,0.5), 0 0 0 #020617`
                    : `inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 0 #020617, 0 5px 8px rgba(0,0,0,0.5), 0 0 15px ${color}`;
                el.style.textShadow = `0 0 5px ${color}`;
            } else {
                el.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 0 #020617, 0 5px 8px rgba(0,0,0,0.6)`;
                el.style.textShadow = 'none';
            }
        });

        requestRef.current = requestAnimationFrame(animate);
    }, [config, activeKeys]);

    const triggerKey = useCallback((key: string, x: number, y: number) => {
        if (key === 'PWR') {
            setConfig(prev => ({ ...prev, isOn: !prev.isOn }));
            setActiveKeys(prev => new Set(prev).add(key));
            playClick();
            return;
        }

        setActiveKeys(prev => new Set(prev).add(key));
        playClick();

        if (config.isOn) {
            ripplesRef.current.push({ key, x, y, time: Date.now() });
        }
    }, [config.isOn, playClick, setConfig]);

    const releaseKey = useCallback((key: string) => {
        setActiveKeys(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    }, []);

    useEffect(() => {
        const handleResize = () => { needsLayoutRef.current = true; };
        window.addEventListener('resize', handleResize);
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [animate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase() === ' ' ? 'SPACE' : e.key.toUpperCase();
            const entry = Array.from(keyRefs.current.values()).find(v => v.label === key);
            if (entry) {
                const rect = entry.el.getBoundingClientRect();
                triggerKey(key, rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase() === ' ' ? 'SPACE' : e.key.toUpperCase();
            releaseKey(key);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [triggerKey, releaseKey]);

    const registerRef = (id: string, el: HTMLDivElement | null, label: string) => {
        if (el) {
            keyRefs.current.set(id, { el, label });
        } else {
            keyRefs.current.delete(id);
        }
    };

    return { registerRef, triggerKey, releaseKey };
};