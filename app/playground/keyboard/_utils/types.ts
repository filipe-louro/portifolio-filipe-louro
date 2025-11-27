export type RGBMode = 'wave' | 'breathing' | 'static' | 'scan' | 'reactive';
export type RGBDirection = 'ltr' | 'rtl';
export type StaticType = 'solid' | 'gradient';

export interface RGBConfig {
    mode: RGBMode;
    direction: RGBDirection;
    staticType: StaticType;
    speed: number;
    brightness: number;
    primaryHue: number;
    isPanelOpen: boolean;
    isOn: boolean;
}

export interface KeyRefData {
    el: HTMLDivElement;
    label: string;
}