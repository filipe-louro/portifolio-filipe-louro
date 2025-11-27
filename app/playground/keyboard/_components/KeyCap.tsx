"use client";

import React from 'react';

interface KeyCapProps {
    label: string;
    uniqueId: string;
    widthClass: string;
    heightClass: string;
    registerRef: (id: string, el: HTMLDivElement | null, label: string) => void;
    onTrigger: (key: string, x: number, y: number) => void;
    onRelease: (key: string) => void;
    children?: React.ReactNode;
}

export const KeyCap = ({
                           label, uniqueId, widthClass, heightClass, registerRef, onTrigger, onRelease, children
                       }: KeyCapProps) => {
    return (
        <div
            ref={el => registerRef(uniqueId, el, label)}
            onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                onTrigger(label, e.clientX, e.clientY);
            }}
            onPointerUp={() => onRelease(label)}
            onPointerLeave={() => onRelease(label)}
            className={`${widthClass} ${heightClass} rounded md:rounded-md flex items-center justify-center text-[10px] md:text-xs font-bold cursor-pointer key-cap text-slate-400 relative overflow-hidden select-none`}
        >
      <span className="relative z-10 pointer-events-none">
        {children || label}
      </span>
        </div>
    );
};