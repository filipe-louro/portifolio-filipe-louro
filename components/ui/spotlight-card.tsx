"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export const SpotlightCard = ({
                                  children,
                                  className = ""
                              }: {
    children: React.ReactNode;
    className?: string
}) => {
    const divRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Atualiza as variáveis CSS diretamente no elemento (Zero React Re-render)
        divRef.current.style.setProperty("--mouse-x", `${x}px`);
        divRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "group relative border border-white/10 bg-white/5 overflow-hidden rounded-xl",
                className
            )}
        >
            <div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 will-change-[opacity]"
                style={{
                    background: `radial-gradient(
                        650px circle at var(--mouse-x) var(--mouse-y),
                        rgba(139, 92, 246, 0.15),
                        transparent 80%
                    )`,
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
};