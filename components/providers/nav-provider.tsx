"use client";

import React, { createContext, useContext, useState } from 'react';

type NavContextType = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

const NavContext = createContext<NavContextType | undefined>(undefined);

export function NavProvider({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState('home');

    return (
        <NavContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </NavContext.Provider>
    );
}

export function useNav() {
    const context = useContext(NavContext);
    if (context === undefined) {
        throw new Error('useNav must be used within a NavProvider');
    }
    return context;
}