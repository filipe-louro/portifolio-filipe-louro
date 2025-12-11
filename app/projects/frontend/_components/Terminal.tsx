"use client";

export const Terminal = () => {
    return (
        <div className="h-48 bg-[#010409] border-t border-slate-800 flex flex-col font-mono text-xs p-4">
            <div className="flex justify-between items-center mb-2 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                <span>Terminal</span>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                </div>
            </div>

            <div className="flex-1 overflow-auto space-y-1 text-slate-300">
                <p><span className="text-green-400">➜</span> <span className="text-cyan-400">~/frontend-app</span> <span className="text-slate-500">$</span> npm run dev</p>
                <p className="text-slate-400 pt-1">
                    &gt; next-dashboard@0.1.0 dev<br/>
                    &gt; next dev
                </p>
                <p className="text-green-400 pt-2">ready - started server on 0.0.0.0:3000, url: http://localhost:3000</p>
                <p className="text-slate-400">event - compiled client and server successfully in 1241 ms (156 modules)</p>
                <p className="text-green-400">wait  - compiling... (client and server)</p>
                <p className="text-slate-400">event - compiled successfully in 133 ms (54 modules)</p>
                <p className="animate-pulse">_</p>
            </div>
        </div>
    );
};