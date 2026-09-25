export const checkSegmentIntersection = (
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    x4: number, y4: number
): boolean => {
    const ccw = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
        return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
    };

    return ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) &&
           ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4);
};
