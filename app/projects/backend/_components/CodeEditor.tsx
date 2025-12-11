"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileCode, FileJson, FileType2, Database } from 'lucide-react';
import { FileNode } from '../_data/projectFiles';

interface CodeEditorProps {
    activeFile: FileNode | null;
    openFiles: FileNode[];
    onCloseTab: (fileId: string, e: React.MouseEvent) => void;
    onSelectTab: (file: FileNode) => void;
}

const getFileIcon = (name: string) => {
    if (name.endsWith('.php')) return <span className="text-[#777bb4] font-bold text-[10px]">PHP</span>; // Ícone PHP Custom ou cor
    if (name.endsWith('.json')) return <FileJson size={14} className="text-yellow-400" />;
    if (name.startsWith('.env')) return <Database size={14} className="text-slate-400" />;
    return <FileCode size={14} className="text-slate-500" />;
};

// Syntax Highlighter PHP / Laravel
const highlightSyntax = (code: string) => {
    if (!code) return "";
    return code
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // PHP Keywords
        .replace(/\b(namespace|use|class|public|private|protected|function|return|if|else|new|extends|implements)\b/g, '<span class="text-[#c678dd]">$1</span>')
        // Types
        .replace(/\b(int|string|void|bool|float|array|object|mixed|Request|JsonResponse)\b/g, '<span class="text-[#e5c07b]">$1</span>')
        // Laravel/PHP Classes
        .replace(/\b([A-Z][a-zA-Z0-9_]*)(?:::| )/g, '<span class="text-[#e5c07b]">$1</span>')
        // PHP Variables ($var)
        .replace(/(\$[a-zA-Z0-9_]+)/g, '<span class="text-[#e06c75]">$1</span>')
        // Strings
        .replace(/'([^']*)'/g, "<span class='text-[#98c379]'>'$1'</span>")
        // Methods calls (->method)
        .replace(/->([a-zA-Z0-9_]+)/g, '-><span class="text-[#61afef]">$1</span>')
        // Static calls (::method)
        .replace(/::([a-zA-Z0-9_]+)/g, '::<span class="text-[#61afef]">$1</span>')
        // Comments
        .replace(/\/\/.*$/gm, '<span class="text-[#5c6370] italic">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//gm, '<span class="text-[#5c6370] italic">$&</span>');
};

export const CodeEditor = ({ activeFile, openFiles, onCloseTab, onSelectTab }: CodeEditorProps) => {
    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-sm font-mono overflow-hidden">

            {/* Tabs Bar */}
            <div className="flex bg-[#252526] overflow-x-auto no-scrollbar border-b border-[#1e1e1e]">
                <AnimatePresence initial={false}>
                    {openFiles.map((file) => {
                        const isActive = activeFile?.id === file.id;
                        return (
                            <motion.div
                                key={file.id}
                                layout
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                onClick={() => onSelectTab(file)}
                                className={`
                  group relative flex items-center gap-2 px-3 py-2.5 min-w-[120px] max-w-[200px] cursor-pointer border-r border-[#1e1e1e] select-none
                  ${isActive ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2d2e]'}
                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute top-0 left-0 right-0 h-[2px] bg-[#777bb4]" // Cor roxa PHP
                                    />
                                )}

                                <span className="shrink-0">{getFileIcon(file.name)}</span>
                                <span className="truncate text-[13px]">{file.name}</span>

                                <button
                                    onClick={(e) => onCloseTab(file.id, e)}
                                    className={`ml-auto rounded-sm p-0.5 opacity-0 group-hover:opacity-100 hover:bg-slate-700 transition-all
                    ${isActive ? 'opacity-100 text-white' : 'text-slate-400'}
                  `}
                                >
                                    <X size={13} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Editor Content */}
            <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
                <AnimatePresence mode="wait">
                    {activeFile ? (
                        <motion.div
                            key={activeFile.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 overflow-auto custom-scrollbar p-6"
                        >
                            <div className="flex">
                                <div className="flex flex-col text-right pr-4 text-[#4b5263] select-none leading-relaxed min-w-[24px]">
                                    {activeFile.content?.split('\n').map((_, i) => (
                                        <span key={i}>{i + 1}</span>
                                    ))}
                                </div>
                                <pre className="font-mono text-[13px] leading-relaxed tab-4 w-full">
                  <code
                      dangerouslySetInnerHTML={{ __html: highlightSyntax(activeFile.content || '') }}
                  />
                </pre>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 select-none">
                            <div className="w-24 h-24 mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                                <span className="text-4xl font-bold text-[#777bb4] opacity-30">PHP</span>
                            </div>
                            <p className="text-sm font-medium">Select a file to view code</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};