export type RGBMode = 'wave' | 'breathing' | 'static' | 'scan' | 'reactive';
export type RGBDirection = 'ltr' | 'rtl';
export type StaticType = 'solid' | 'gradient';

export type SwitchType = 'blue' | 'brown' | 'red';

export interface RGBConfig {
    mode: RGBMode;
    direction: RGBDirection;
    staticType: StaticType;
    speed: number;
    brightness: number;
    primaryHue: number;
    isPanelOpen: boolean;
    isOn: boolean;
    soundEnabled: boolean;
    soundVolume: number;
    switchType: SwitchType;
}

export interface KeyRefData {
    el: HTMLDivElement;
    label: string;
}