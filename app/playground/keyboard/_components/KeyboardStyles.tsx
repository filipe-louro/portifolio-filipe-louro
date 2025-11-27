"use client";

import React from 'react';

export const KeyboardStyles = () => (
    <style jsx global>{`
    .glass-panel {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      will-change: transform, opacity;
    }
    .key-cap {
      background: #0f172a;
      box-shadow: 
        inset 0 1px 0 rgba(255,255,255,0.1),
        0 4px 0 #020617,
        0 5px 8px rgba(0,0,0,0.6);
      transition: transform 0.05s ease, box-shadow 0.05s ease;
      border: 1px solid rgba(255,255,255,0.05);
      will-change: box-shadow, color, border-color;
      transform: translateZ(0);
    }
    .key-cap:active, .key-cap.active {
      transform: translateY(4px);
      box-shadow: 
        inset 0 2px 5px rgba(0,0,0,0.5),
        0 0 0 #020617,
        0 0 0 rgba(0,0,0,0);
    }
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
    }
    input[type=range]:focus {
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 14px;
      width: 14px;
      border-radius: 50%;
      background: #22d3ee;
      cursor: pointer;
      margin-top: -5px;
      box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
      transition: transform 0.1s, background 0.2s;
    }
    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      background: #67e8f9;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      cursor: pointer;
      background: #334155;
      border-radius: 2px;
    }
  `}</style>
);