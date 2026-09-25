import { SwitchType } from './types';

let audioCtx: AudioContext | null = null;
let sharedNoiseBuffer: AudioBuffer | null = null;

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

const getNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    if (sharedNoiseBuffer && sharedNoiseBuffer.sampleRate === ctx.sampleRate) {
        return sharedNoiseBuffer;
    }

    const duration = 0.08;
    const frameCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
        channelData[i] = Math.random() * 2 - 1;
    }

    sharedNoiseBuffer = buffer;
    return buffer;
};

export const playSwitchSound = (switchType: SwitchType, volumePercent: number) => {
    if (volumePercent <= 0) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    const normalizedVolume = Math.min(1, Math.max(0, volumePercent / 100)) * 0.4;
    masterGain.gain.setValueAtTime(normalizedVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;
    const pitchJitter = 0.96 + Math.random() * 0.08;
    const noiseBuffer = getNoiseBuffer(ctx);

    if (switchType === 'blue') {
        // Clickleaf metálico de alta frequência
        const clickNoise = ctx.createBufferSource();
        clickNoise.buffer = noiseBuffer;

        const clickFilter = ctx.createBiquadFilter();
        clickFilter.type = 'bandpass';
        clickFilter.frequency.setValueAtTime(3200 * pitchJitter, now);
        clickFilter.Q.setValueAtTime(8, now);

        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(0.8, now);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

        clickNoise.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(masterGain);

        clickNoise.start(now);
        clickNoise.stop(now + 0.016);

        // Impacto plástico inferior (bottom-out clack)
        const bottomOsc = ctx.createOscillator();
        bottomOsc.type = 'triangle';
        bottomOsc.frequency.setValueAtTime(340 * pitchJitter, now + 0.004);
        bottomOsc.frequency.exponentialRampToValueAtTime(90, now + 0.038);

        const bottomGain = ctx.createGain();
        bottomGain.gain.setValueAtTime(0.4, now + 0.004);
        bottomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        bottomOsc.connect(bottomGain);
        bottomGain.connect(masterGain);

        bottomOsc.start(now + 0.004);
        bottomOsc.stop(now + 0.042);
    } else if (switchType === 'brown') {
        // Bump tátil mais suave e corpo médio
        const tactileNoise = ctx.createBufferSource();
        tactileNoise.buffer = noiseBuffer;

        const tactileFilter = ctx.createBiquadFilter();
        tactileFilter.type = 'bandpass';
        tactileFilter.frequency.setValueAtTime(1200 * pitchJitter, now);
        tactileFilter.Q.setValueAtTime(3, now);

        const tactileGain = ctx.createGain();
        tactileGain.gain.setValueAtTime(0.35, now);
        tactileGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

        tactileNoise.connect(tactileFilter);
        tactileFilter.connect(tactileGain);
        tactileGain.connect(masterGain);

        tactileNoise.start(now);
        tactileNoise.stop(now + 0.026);

        // Batente inferior com tom aveludado
        const bottomOsc = ctx.createOscillator();
        bottomOsc.type = 'sine';
        bottomOsc.frequency.setValueAtTime(260 * pitchJitter, now + 0.005);
        bottomOsc.frequency.exponentialRampToValueAtTime(70, now + 0.045);

        const bottomGain = ctx.createGain();
        bottomGain.gain.setValueAtTime(0.35, now + 0.005);
        bottomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.046);

        bottomOsc.connect(bottomGain);
        bottomGain.connect(masterGain);

        bottomOsc.start(now + 0.005);
        bottomOsc.stop(now + 0.048);
    } else {
        // Red: linear, sem clique inicial, batente profundo (thock macio)
        const thockNoise = ctx.createBufferSource();
        thockNoise.buffer = noiseBuffer;

        const thockFilter = ctx.createBiquadFilter();
        thockFilter.type = 'lowpass';
        thockFilter.frequency.setValueAtTime(650 * pitchJitter, now);

        const thockGain = ctx.createGain();
        thockGain.gain.setValueAtTime(0.4, now);
        thockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        thockNoise.connect(thockFilter);
        thockFilter.connect(thockGain);
        thockGain.connect(masterGain);

        thockNoise.start(now);
        thockNoise.stop(now + 0.036);

        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(210 * pitchJitter, now);
        subOsc.frequency.exponentialRampToValueAtTime(55, now + 0.05);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.45, now);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.052);

        subOsc.connect(subGain);
        subGain.connect(masterGain);

        subOsc.start(now);
        subOsc.stop(now + 0.054);
    }

    setTimeout(() => {
        masterGain.disconnect();
    }, 120);
};
