let audioCtx: AudioContext | null = null;
let activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;

    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return null;
        audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    return audioCtx;
};

export const playChladniChime = (m: number, n: number, volumePercent: number) => {
    if (volumePercent <= 0) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    activeNodes.forEach(({ osc, gain }) => {
        try {
            gain.gain.setValueAtTime(0, ctx.currentTime);
            osc.stop(ctx.currentTime + 0.05);
            osc.disconnect();
            gain.disconnect();
        } catch {
            // Contexto pode já estar encerrado
        }
    });
    activeNodes = [];

    const fundamental = Math.min(1200, Math.max(120, 110 * Math.sqrt(m * m + n * n * 0.75)));
    const masterGain = ctx.createGain();
    const volume = (volumePercent / 100) * 0.25;
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Parciais inarmônicas típicas de placas circulares e retangulares de metal
    const partialRatios = [1.0, 1.58, 2.24];
    const partialGains = [0.6, 0.25, 0.15];
    const duration = 1.8;
    const now = ctx.currentTime;

    partialRatios.forEach((ratio, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = index === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(fundamental * ratio, now);

        const initialGain = partialGains[index];
        gain.gain.setValueAtTime(initialGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration + 0.05);

        activeNodes.push({ osc, gain });
    });

    setTimeout(() => {
        masterGain.disconnect();
    }, (duration + 0.1) * 1000);
};
