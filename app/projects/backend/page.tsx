import { Metadata } from 'next';
import { IDE } from './_components/IDE';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Backend Architecture | Project View',
    description: 'Laravel API Structure walkthrough.',
};

export default function BackendProjectPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col">
            <div className="max-w-7xl mx-auto w-full mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Backend Architecture</h1>
                        <p className="text-slate-400 text-sm">Laravel 10 • REST API • JWT Auth</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-medium text-purple-400">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    Server Running
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full">
                <IDE />
            </div>

            <div className="max-w-7xl mx-auto w-full mt-12 grid md:grid-cols-3 gap-8 text-slate-400 text-sm leading-relaxed">
                <div>
                    <h3 className="text-white font-bold mb-2">Architecture</h3>
                    <p>Robust MVC architecture following SOLID principles. Implements Service Repository pattern for complex logic and clean Controllers.</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-2">Performance</h3>
                    <p>Optimized with Redis caching for heavy queries and database indexing. Queue system implementation for asynchronous tasks like email sending.</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-2">Tech Stack</h3>
                    <ul className="flex flex-wrap gap-2 mt-2">
                        {['Laravel', 'PHP 8.2', 'MySQL', 'Redis', 'Docker'].map(tag => (
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