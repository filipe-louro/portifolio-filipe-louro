"use client";

import { motion } from "framer-motion";

export const TemplateWrapper = ({ children, path }: { children: React.ReactNode; path: string }) => {
    return (
        <motion.div
            key={path}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                staggerChildren: 0.1,
            }}
            className="min-h-screen w-full"
        >
            {children}
        </motion.div>
    );
};