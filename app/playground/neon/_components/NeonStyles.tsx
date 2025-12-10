"use client";

import React from 'react';

export const NeonStyles = () => (
    <style jsx global>{`
    @keyframes neon-flicker {
      0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
        opacity: 1;
        filter: brightness(1);
      }
      20%, 24%, 55% {
        opacity: 0.5;
        filter: brightness(0.5);
      }
    }
    .animate-neon-flicker {
      animation: neon-flicker 3s infinite;
    }
    
    /* Fontes personalizadas se desejar importar do Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@900&family=Monoton&display=swap');

    .font-neon-modern { font-family: 'Be Vietnam Pro', sans-serif; }
    .font-neon-retro { font-family: 'Monoton', cursive; }
  `}</style>
);