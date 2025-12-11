"use client";

import { useState } from 'react';
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, FileJson, FileType2 } from 'lucide-react';
import { FileNode } from '../_data/projectFiles';
import { motion, AnimatePresence } from 'framer-motion';

interface FileExplorerProps {
    files: FileNode[];
    activeFileId: string | null;
    onFileSelect: (file: FileNode) => void;
    level?: number;
}

const getFileIcon = (name: string) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode size={15} className="text-cyan-400" />;
    if (name.endsWith('.css')) return <FileType2 size={15} className="text-blue-400" />;
    if (name.endsWith('.json')) return <FileJson size={15} className="text-yellow-400" />;
    if (name.endsWith('.js')) return <FileCode size={15} className="text-yellow-300" />;
    return <FileCode size={15} className="text-slate-500" />;
};

export const FileExplorer = ({ files, activeFileId, onFileSelect, level = 0 }: FileExplorerProps) => {
    return (
        <div className="select-none font-mono text-[13px]">
            {files.map((node) => (
                <FileNodeItem
                    key={node.id}
                    node={node}
                    activeFileId={activeFileId}
                    onFileSelect={onFileSelect}
                    level={level}
                />
            ))}
        </div>
    );
};

const FileNodeItem = ({ node, activeFileId, onFileSelect, level }: any) => {
    const [isOpen, setIsOpen] = useState(node.isOpen || false);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onFileSelect(node);
        }
    };

    const isActive = node.id === activeFileId;

    return (
        <div>
            <div
                onClick={handleToggle}
                className={`flex items-center py-1 cursor-pointer transition-colors border-l-[2px]
          ${isActive
                    ? 'bg-[#37373d]/50 text-white border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#2a2d2e] border-transparent'}
        `}
                style={{ paddingLeft: `${level * 14 + 10}px` }}
            >
        <span className="mr-1.5 opacity-80">
          {node.type === 'folder' ? (
              isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
              <span className="w-3.5 inline-block" />
          )}
        </span>

                <span className="mr-2">
          {node.type === 'folder' ? (
              isOpen ? <FolderOpen size={16} className="text-indigo-400" /> : <Folder size={16} className="text-indigo-400" />
          ) : (
              getFileIcon(node.name)
          )}
        </span>

                <span className="truncate leading-none pt-0.5">{node.name}</span>
            </div>

            <AnimatePresence initial={false}>
                {node.type === 'folder' && isOpen && node.children && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <FileExplorer
                            files={node.children}
                            activeFileId={activeFileId}
                            onFileSelect={onFileSelect}
                            level={level + 1}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};