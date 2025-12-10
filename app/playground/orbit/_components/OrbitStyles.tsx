"use client";

import React from 'react';

export const OrbitStyles = () => (
    <style jsx global>{`
    .glass-panel {
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
    }
    .glow-text {
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }
    /* Range Input Styles */
    input[type=range] {
      -webkit-appearance: none;
      background: transparent;
    }
    input[type=range]:focus {
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 18px;
      width: 18px;
      border-radius: 50%;
      background: #60a5fa;
      border: 2px solid white;
      margin-top: -7px;
      box-shadow: 0 0 15px rgba(96, 165, 250, 0.8);
      cursor: pointer;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      background: #1e293b;
      border-radius: 2px;
      cursor: pointer;
    }
  `}</style>
);