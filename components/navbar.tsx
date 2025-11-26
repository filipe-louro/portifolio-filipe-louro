"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useNav } from "@/components/providers/nav-provider";

export const Navbar = () => {
    const { activeTab, setActiveTab } = useNav();
    const pathname = usePathname();
    const router = useRouter();

    const isHome = pathname === "/";
    const currentActive = isHome ? activeTab : "lab";

    const navItems = [
        { id: 'home', label: 'Home', type: 'action' },
        { id: 'portfolio', label: 'Portfolio', type: 'action' },
        { id: 'lab', label: 'Lab', type: 'route', path: '/playground' },
        { id: 'contact', label: 'Contato', type: 'action' },
    ];

    const handleNavigation = (item: typeof navItems[0]) => {
        if (item.type === 'route' && item.path) {
            router.push(item.path);
            return;
        }

        // Se for ação (Home/Portfolio) e não estiver na home, volta pra home primeiro
        if (!isHome) {
            setActiveTab(item.id);
            router.push("/");
        } else {
            setActiveTab(item.id);
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
            <div className="flex items-center gap-1 p-1 rounded-full border border-white/10 bg-slate-950/50 backdrop-blur-md shadow-lg shadow-violet-500/10">
                {navItems.map((item) => {
                    const isActive = currentActive === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item)}
                            className={cn(
                                "relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full",
                                isActive ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/10 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </motion.nav>
    );
};