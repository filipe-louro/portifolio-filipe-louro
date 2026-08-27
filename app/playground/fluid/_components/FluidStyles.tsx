"use client";

import React from 'react';

export const FluidStyles = () => (
    <style jsx global>{`
    .fluid-panel {
      background: rgba(2, 6, 23, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .fluid-panel input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
    }
    .fluid-panel input[type=range]:focus {
      outline: none;
    }
    .fluid-panel input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      background: #1e293b;
      border-radius: 2px;
      cursor: pointer;
    }
    .fluid-panel input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #2dd4bf;
      border: 2px solid white;
      margin-top: -6px;
      box-shadow: 0 0 12px rgba(45, 212, 191, 0.8);
      cursor: pointer;
    }
    .fluid-panel input[type=range]::-moz-range-track {
      width: 100%;
      height: 4px;
      background: #1e293b;
      border-radius: 2px;
      cursor: pointer;
    }
    .fluid-panel input[type=range]::-moz-range-thumb {
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #2dd4bf;
      border: 2px solid white;
      box-shadow: 0 0 12px rgba(45, 212, 191, 0.8);
      cursor: pointer;
    }
    .fluid-panel::-webkit-scrollbar {
      width: 6px;
    }
    .fluid-panel::-webkit-scrollbar-thumb {
      background: #134e4a;
      border-radius: 3px;
    }
  `}</style>
);
