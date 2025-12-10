"use client";

import { useState, useMemo } from 'react';
import { hexToRgba } from '../_utils/colorUtils';

export const useNeonState = () => {
    const [text, setText] = useState("CYBER");
    const [color, setColor] = useState("#d946ef"); // Pink default
    const [isOn, setIsOn] = useState(true);
    const [flicker, setFlicker] = useState(false);
    const [fontMode, setFontMode] = useState<'modern' | 'retro'>('modern');

    // Gera a sombra CSS dinamicamente baseado no estado
    const neonStyle = useMemo(() => {
        if (!isOn) {
            return {
                color: '#222',
                textShadow: 'none',
                filter: 'grayscale(1) brightness(0.3)',
                opacity: 0.3
            };
        }

        const rgba = hexToRgba(color, 1);
        const rgbaDim = hexToRgba(color, 0.7);
        const rgbaWeak = hexToRgba(color, 0.4);

        return {
            color: '#fff',
            textShadow: `
        0 0 5px #fff,
        0 0 10px #fff,
        0 0 20px ${rgba},
        0 0 40px ${rgba},
        0 0 80px ${rgbaDim},
        0 0 120px ${rgbaWeak}
      `,
            opacity: 1,
            filter: 'brightness(1.1)'
        };
    }, [isOn, color]);

    return {
        text, setText,
        color, setColor,
        isOn, setIsOn,
        flicker, setFlicker,
        fontMode, setFontMode,
        neonStyle
    };
};