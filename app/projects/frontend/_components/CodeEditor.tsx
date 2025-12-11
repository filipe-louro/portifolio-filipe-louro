"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileCode, FileJson, FileType2 } from 'lucide-react';
import { FileNode } from '../_data/projectFiles';

interface CodeEditorProps {
    activeFile: FileNode | null;
    openFiles: FileNode[];
    onCloseTab: (fileId: string, e: React.MouseEvent) => void;
    onSelectTab: (file: FileNode) => void;
}

const getFileIcon = (name: string) => {
    if (name.endsWith('.tsx')) return <FileCode size={14} className="text-cyan-400" />;
    if (name.endsWith('.css')) return <FileType2 size={14} className="text-blue-400" />;
    if (name.endsWith('.json')) return <FileJson size={14} className="text-yellow-400" />;
    return <FileCode size={14} className="text-slate-500" />;
};

// Syntax Highlighter Simples
const highlightSyntax = (code: string) => {
    if (!code) return "";
    return code
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\b(import|export|default|function|return|const|let|var|if|else|for|while|from|type|interface)\b/g, '<span class="text-[#c678dd]">$1</span>')
        .replace(/\b(use client|useState|useEffect|useMemo|useCallback)\b/g, '<span class="text-[#56b6c2]">$1</span>')
        .replace(/\b(className|href|key|onClick|disabled|variant|size)\b/g, '<span class="text-[#d19a66]">$1</span>')
        .replace(/"([^"]*)"/g, '<span class="text-[#98c379]">"$1"</span>')
        .replace(/'([^']*)'/g, "<span class='text-[#98c379]'>'$1'</span>")
        .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="text-[#e5c07b]">$1</span>')
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
                                        className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500"
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
                            {/* Line Numbers + Code */}
                            <div className="flex">
                                <div className="flex flex-col text-right pr-4 text-[#4b5263] select-none leading-relaxed">
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
                                <FileCode size={48} className="opacity-20" />
                            </div>
                            <p className="text-sm font-medium">Select a file to view code</p>
                            <p className="text-xs mt-2 opacity-50">CMD + P to search files</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};