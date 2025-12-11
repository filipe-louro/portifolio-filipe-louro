"use client";

import { useState, useEffect } from 'react';
import { projectFiles, FileNode } from '../_data/projectFiles';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { Terminal } from './Terminal';
import { Sidebar, Search, GitBranch, Settings, MoreHorizontal } from 'lucide-react';

export const IDE = () => {
    // CORREÇÃO: Caminho ajustado para a estrutura atual (root -> app -> page.tsx)
    // Adicionei verificações de segurança (?.) para evitar o crash se a estrutura mudar
    const initialFile = projectFiles[0]?.children?.[0]?.children?.[0] || projectFiles[0];

    const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);

    // Efeito para garantir que o arquivo inicial seja carregado apenas no cliente
    // e evitar erros de hidratação ou acesso a undefined
    useEffect(() => {
        if (initialFile && initialFile.type === 'file') {
            setOpenFiles([initialFile]);
            setActiveFileId(initialFile.id);
        }
    }, []);

    // Encontra o objeto do arquivo ativo baseado no ID
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
                // Abre o último arquivo da lista (comportamento padrão de IDE)
                setActiveFileId(newOpenFiles[newOpenFiles.length - 1].id);
            } else {
                setActiveFileId(null);
            }
        }
    };

    return (
        <div className="w-full h-[85vh] bg-[#1e1e1e] rounded-lg overflow-hidden border border-[#333] shadow-2xl flex flex-col md:flex-row font-sans">

            {/* Activity Bar (Left Icon Strip) */}
            <div className="w-12 bg-[#333333] border-r border-[#252526] flex flex-col items-center py-4 gap-6 text-[#858585] z-10 hidden md:flex">
                <Sidebar className="text-white cursor-pointer hover:text-white transition-colors" size={24} strokeWidth={1.5} />
                <Search className="hover:text-white cursor-pointer transition-colors" size={24} strokeWidth={1.5} />
                <GitBranch className="hover:text-white cursor-pointer transition-colors" size={24} strokeWidth={1.5} />
                <div className="flex-1" />
                <Settings className="hover:text-white cursor-pointer transition-colors" size={24} strokeWidth={1.5} />
            </div>

            {/* Sidebar Explorer */}
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

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                {/* Editor Area */}
                <div className="flex-1 min-h-0 relative">
                    <CodeEditor
                        activeFile={activeFile}
                        openFiles={openFiles}
                        onCloseTab={handleCloseTab}
                        onSelectTab={(file) => setActiveFileId(file.id)}
                    />
                </div>

                {/* Integrated Terminal */}
                <Terminal />
            </div>
        </div>
    );
};