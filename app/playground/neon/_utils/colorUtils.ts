export const hexToRgba = (hex: string, alpha: number = 1): string => {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        return `rgba(255, 255, 255, ${alpha})`;
    }
    let digits = hex.substring(1);
    if (digits.length === 3) {
        digits = digits.split('').map((d) => d + d).join('');
    }
    const value = parseInt(digits, 16);
    return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
};
