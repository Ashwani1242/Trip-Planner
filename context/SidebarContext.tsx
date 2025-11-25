import React, { useContext } from 'react'

type SidebarContextType = {
    isSidebarOpen: boolean;
    toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768;
        }
        return true;
    });

    React.useEffect(() => {
        const handleResize = () => {
            const isMdOrLarger = window.innerWidth >= 768;
            setIsSidebarOpen(isMdOrLarger);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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