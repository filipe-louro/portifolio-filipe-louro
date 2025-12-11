"use client";

import { motion } from "framer-motion";

export const TemplateWrapper = ({ children, path }: { children: React.ReactNode; path: string }) => {
    return (
        <motion.div
            key={path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
                type: "tween",
                ease: "easeOut",
                duration: 0.3,
            }}
            className="min-h-screen w-full"
        >
            {children}
        </motion.div>
    );
};