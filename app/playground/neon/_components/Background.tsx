"use client";

import React from 'react';

export const Background = () => (
    <>
        {/* Textura de Parede de Tijolos Escura */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-brick-wall.png')] opacity-40 pointer-events-none z-0" />

        {/* Vinheta para focar no centro */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_90%)] pointer-events-none z-0" />

        {/* Cabos/Fios Decorativos (SVG) */}
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 opacity-30 pointer-events-none z-0">
            <path d="M100,-20 Q300,80 500,20 T900,10" fill="none" stroke="#1a1a1a" strokeWidth="4" />
            <path d="M-100,-10 Q200,100 600,30" fill="none" stroke="#111" strokeWidth="6" />
        </svg>
    </>
);