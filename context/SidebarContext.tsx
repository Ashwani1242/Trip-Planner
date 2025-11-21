import React, { useContext } from 'react'

type SidebarContextType = {
    isSidebarOpen: boolean;
    toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(true);

    const toggle = () => setIsSidebarOpen((prev) => !prev);
    return (
        <SidebarContext.Provider value={{ isSidebarOpen, toggle }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}