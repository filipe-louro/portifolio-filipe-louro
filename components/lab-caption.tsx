import { cn } from '@/lib/utils';

interface LabCaptionProps {
    title: string;
    subtitle: string;
    titleClassName: string;
    subtitleClassName: string;
}

// Identidade padrão de um Lab (zona 1 do HUD — ver CLAUDE.md, seção 14).
// Referência visual: o caption do Gargantua.
export const LabCaption = ({ title, subtitle, titleClassName, subtitleClassName }: LabCaptionProps) => (
    <div className="absolute bottom-8 left-6 md:bottom-12 md:left-12 z-10 text-white/50 pointer-events-none select-none mix-blend-screen">
        <h1 className={cn('text-3xl md:text-4xl font-extralight tracking-[0.2em] mb-1 uppercase', titleClassName)}>
            {title}
        </h1>
        <p className={cn('text-xs uppercase opacity-60 tracking-widest', subtitleClassName)}>
            {subtitle}
        </p>
    </div>
);
