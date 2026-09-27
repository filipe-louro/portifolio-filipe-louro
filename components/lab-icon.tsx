import React from 'react';
import {
    Keyboard,
    Atom,
    CircleDashed,
    Terminal,
    Zap,
    Mountain,
    Sparkles,
    Waves,
    Disc,
    Boxes,
    Scissors,
    Droplets,
    Infinity,
    Fingerprint,
    Hourglass,
    Network,
    Magnet,
    Pipette,
    Orbit,
    Telescope,
} from 'lucide-react';

interface LabIconProps {
    name: string;
    className?: string;
    size?: number;
}

export const LabIcon: React.FC<LabIconProps> = ({ name, className = '', size = 20 }) => {
    const props = { size, className };

    switch (name) {
        case 'Keyboard':
            return <Keyboard {...props} />;
        case 'Atom':
            return <Atom {...props} className={`${className} animate-spin-slow`} />;
        case 'CircleDashed':
            return <CircleDashed {...props} className={`${className} animate-spin-slow`} />;
        case 'Terminal':
            return <Terminal {...props} />;
        case 'Zap':
            return <Zap {...props} />;
        case 'Mountain':
            return <Mountain {...props} />;
        case 'Sparkles':
            return <Sparkles {...props} />;
        case 'Waves':
            return <Waves {...props} />;
        case 'Disc':
            return <Disc {...props} />;
        case 'Boxes':
            return <Boxes {...props} />;
        case 'Scissors':
            return <Scissors {...props} />;
        case 'Droplets':
            return <Droplets {...props} />;
        case 'Infinity':
            return <Infinity {...props} />;
        case 'Fingerprint':
            return <Fingerprint {...props} />;
        case 'Hourglass':
            return <Hourglass {...props} />;
        case 'Network':
            return <Network {...props} />;
        case 'Magnet':
            return <Magnet {...props} />;
        case 'Pipette':
        case 'Dye':
            return <Pipette {...props} />;
        case 'Orbit':
            return <Orbit {...props} />;
        case 'Telescope':
        case 'Galaxy':
            return <Telescope {...props} />;
        case 'WaterWave':
        case 'Radio':
            return <Waves {...props} />;
        default:
            return <Sparkles {...props} />;
    }
};
