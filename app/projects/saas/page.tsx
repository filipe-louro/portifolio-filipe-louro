import { Metadata } from 'next';
import { IDE } from './_components/IDE';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'E-commerce Infrastructure | Project View',
    description: 'Magento 2 Microservices Architecture walkthrough.',
};

export default function SaasProjectPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col">
            <div className="max-w-7xl mx-auto w-full mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">E-commerce & SaaS</h1>
                        <p className="text-slate-400 text-sm">Magento 2 • Docker Infrastructure • Stripe API</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-medium text-orange-400">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    System Operational
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full">
                <IDE />
            </div>

            <div className="max-w-7xl mx-auto w-full mt-12 grid md:grid-cols-3 gap-8 text-slate-400 text-sm leading-relaxed">
                <div>
                    <h3 className="text-white font-bold mb-2">Infrastructure</h3>
                    <p>Containerized environment using Docker Compose for orchestration. Includes services for Redis (Cache), Elasticsearch (Search), and Varnish (FPC) to ensure high performance.</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-2">Custom Integration</h3>
                    <p>Implemented a custom Magento module observing checkout events to capture payments via Stripe API asynchronously, reducing cart abandonment.</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-2">Tech Stack</h3>
                    <ul className="flex flex-wrap gap-2 mt-2">
                        {['Magento 2', 'PHP 8.2', 'Docker', 'Elasticsearch', 'Redis', 'Varnish'].map(tag => (
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