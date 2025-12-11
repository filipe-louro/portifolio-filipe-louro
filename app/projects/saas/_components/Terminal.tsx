"use client";

export const Terminal = () => {
    return (
        <div className="h-48 bg-[#010409] border-t border-slate-800 flex flex-col font-mono text-xs p-4">
            <div className="flex justify-between items-center mb-2 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                <span>Terminal - production</span>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                </div>
            </div>

            <div className="flex-1 overflow-auto space-y-1 text-slate-300">
                <p><span className="text-red-400">magento@cloud</span>:<span className="text-blue-400">~/htdocs</span><span className="text-slate-500">$</span> bin/magento setup:upgrade</p>
                <p className="text-slate-400 pt-1">Cache cleared successfully</p>
                <p className="text-slate-400">File system cleanup...</p>
                <p className="text-slate-400">Updating modules:</p>
                <p className="text-green-400 pl-2">Vendor_StripeIntegration: 1.0.2 -{'>'} 1.0.3</p>
                <p className="text-slate-400 pt-2"><span className="text-red-400">magento@cloud</span>:<span className="text-blue-400">~/htdocs</span><span className="text-slate-500">$</span> bin/magento indexer:reindex</p>
                <p className="text-slate-400">Design Config Grid index has been rebuilt successfully in 00:00:00</p>
                <p className="text-slate-400">Customer Grid index has been rebuilt successfully in 00:00:02</p>
                <p className="text-slate-400">Product Flat Data index has been rebuilt successfully in 00:00:05</p>
                <p className="text-green-400 pt-1">Ready for deployment.</p>
                <p className="animate-pulse">_</p>
            </div>
        </div>
    );
};