export interface Building {
    x: number;
    width: number;
    height: number;
    color: string;
    hasSpire: boolean;
}

export const generateCityData = (w: number, h: number): Building[] => {
    const buildings: Building[] = [];
    let currentX = -50;
    const colors = ['#06b6d4', '#d946ef', '#8b5cf6'];

    while (currentX < w + 50) {
        const width = 30 + Math.random() * 50;
        const distFromCenter = Math.abs(w/2 - (currentX + width/2));
        const centerBias = Math.max(0.5, 1 - (distFromCenter / w));
        const height = 40 + (Math.random() * 150 * centerBias) + (Math.random() > 0.9 ? 100 : 0);

        buildings.push({
            x: currentX,
            width,
            height,
            color: colors[Math.floor(Math.random() * colors.length)],
            hasSpire: Math.random() > 0.7
        });
        currentX += width - (Math.random() * 15);
    }

    return buildings.sort((a, b) => a.height - b.height);
};