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
                <p><span className="text-green-400">user@server</span>:<span className="text-blue-400">~/laravel-api</span><span className="text-slate-500">$</span> php artisan migrate</p>
                <p className="text-slate-400 pt-1">
                    Migrating: <span className="text-yellow-300">2014_10_12_000000_create_users_table</span>
                </p>
                <p className="text-green-400">Migrated:  2014_10_12_000000_create_users_table (12.34ms)</p>
                <p className="text-slate-400 pt-2"><span className="text-green-400">user@server</span>:<span className="text-blue-400">~/laravel-api</span><span className="text-slate-500">$</span> php artisan serve</p>
                <p className="text-slate-300">   INFO  Server running on [http://127.0.0.1:8000].</p>
                <p className="text-slate-400 pt-1">   Press Ctrl+C to stop the server</p>
                <p className="text-slate-400 pt-2">[2024-03-20 10:41:23] <span className="text-green-400">200</span> GET /api/users</p>
                <p className="text-slate-400">[2024-03-20 10:41:25] <span className="text-green-400">201</span> POST /api/login</p>
                <p className="animate-pulse">_</p>
            </div>
        </div>
    );
};