"use client";

import { useState, useEffect } from 'react';
import { projectFiles, FileNode } from '../_data/projectFiles';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { Terminal } from './Terminal';
import { Sidebar, Search, GitBranch, Settings, MoreHorizontal } from 'lucide-react';

export const IDE = () => {
    // Caminho seguro para o arquivo inicial: root -> app -> app -> http -> controllers -> UserController.php
    const initialFile = projectFiles[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0] || projectFiles[0];

    const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);

    useEffect(() => {
        if (initialFile && initialFile.type === 'file') {
            setOpenFiles([initialFile]);
            setActiveFileId(initialFile.id);
        }
    }, []);

    const activeFile = openFiles.find(f => f.id === activeFileId) || null;

    const handleFileSelect = (file: FileNode) => {
        if (file.type !== 'file') return;

        if (!openFiles.find(f => f.id === file.id)) {
            setOpenFiles([...openFiles, file]);
        }
        setActiveFileId(file.id);
    };

    const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newOpenFiles = openFiles.filter(f => f.id !== fileId);
        setOpenFiles(newOpenFiles);

        if (activeFileId === fileId) {
            if (newOpenFiles.length > 0) {
                setActiveFileId(newOpenFiles[newOpenFiles.length - 1].id);
            } else {
                setActiveFileId(null);
            }
        }
    };

    return (
        <div className="w-full h-[85vh] bg-[#1e1e1e] rounded-lg overflow-hidden border border-[#333] shadow-2xl flex flex-col md:flex-row font-sans">
            <div className="w-12 bg-[#333333] border-r border-[#252526] flex flex-col items-center py-4 gap-6 text-[#858585] z-10 hidden md:flex">
                <Sidebar className="text-white cursor-pointer hover:text-white transition-colors" size={24} strokeWidth={1.5} />
                <Search className="hover:text-white cursor-pointer transition-colors" size={24} strokeWidth={1.5} />
                <GitBranch className="hover:text-white cursor-pointer transition-colors" size={24} strokeWidth={1.5} />
                <div className="flex-1" />
                <Settings className="hover:text-white cursor-pointer transition-colors" size={24} strokeWidth={1.5} />
            </div>

            <div className="w-64 bg-[#252526] border-r border-[#1e1e1e] flex flex-col hidden md:flex">
                <div className="h-9 flex items-center px-4 text-[11px] font-bold text-[#bbbbbb] uppercase tracking-wide">
                    Explorer
                    <MoreHorizontal size={14} className="ml-auto opacity-50 cursor-pointer hover:opacity-100" />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                    <FileExplorer
                        files={projectFiles}
                        activeFileId={activeFileId}
                        onFileSelect={handleFileSelect}
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                <div className="flex-1 min-h-0 relative">
                    <CodeEditor
                        activeFile={activeFile}
                        openFiles={openFiles}
                        onCloseTab={handleCloseTab}
                        onSelectTab={(file) => setActiveFileId(file.id)}
                    />
                </div>
                <Terminal />
            </div>
        </div>
    );
};