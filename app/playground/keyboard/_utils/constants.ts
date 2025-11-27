import { RGBConfig } from "./types";

export const KEY_LAYOUT = [
    ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'DEL'],
    ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],
    ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],
    ['CTRL', 'WIN', 'ALT', 'SPACE', 'ALT', 'FN', 'MENU', 'CTRL']
];

export const DEFAULT_CONFIG: RGBConfig = {
    mode: 'wave',
    direction: 'ltr',
    staticType: 'solid',
    speed: 5,
    brightness: 100,
    primaryHue: 280,
    isPanelOpen: false,
    isOn: true
};