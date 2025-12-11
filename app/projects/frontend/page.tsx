import { Metadata } from 'next';
import { IDE } from './_components/IDE';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Frontend Engineering | Project View',
    description: 'Interactive code walkthrough of a Next.js Dashboard Architecture.',
};

export default function FrontendProjectPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col">

            {/* Header / Navigation */}
            <div className="max-w-7xl mx-auto w-full mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Frontend Engineering</h1>
                        <p className="text-slate-400 text-sm">Next.js 14 • Dashboard Architecture • Server Components</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-medium text-green-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Interactive Demo
                </div>
            </div>

            {/* IDE Container */}
            <div className="flex-1 max-w-7xl mx-auto w-full">
                <IDE />
            </div>

            {/* Project Details Footer */}
            <div className="max-w-7xl mx-auto w-full mt-12 grid md:grid-cols-3 gap-8 text-slate-400 text-sm leading-relaxed">
                <div>
                    <h3 className="text-white font-bold mb-2">Technical Overview</h3>
                    <p>This project demonstrates a scalable dashboard architecture using Next.js App Router. Key features include modular component design, optimized rendering strategies, and strictly typed TypeScript implementation.</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-2">Key Challenges</h3>
                    <p>Handling complex state management for real-time data visualization while maintaining 100/100 Lighthouse performance scores. Implemented aggressive caching strategies using React Query.</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-2">Stack</h3>
                    <ul className="flex flex-wrap gap-2 mt-2">
                        {['Next.js', 'TypeScript', 'Tailwind', 'Recharts', 'Zustand'].map(tag => (
                            <li key={tag} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs">
                                {tag}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </main>
    );
}