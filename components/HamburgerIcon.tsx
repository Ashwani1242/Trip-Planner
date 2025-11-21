"use client";

import * as React from "react";
import { PanelLeftOpen, PanelRight } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

export function HamburgerToggle() {
    const {isSidebarOpen, toggle} = useSidebar();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" />;
    }

    return (
        <button
            onClick={toggle}
            className="p-3 rounded-xl bg-background ring-2 ring-border/30 hover:ring-border/50 text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-border"
            aria-label="Toggle sidebar">
            {isSidebarOpen ? (
                <PanelRight className="h-5 w-5" />
            ) : (
                <PanelLeftOpen className="h-5 w-5" />
            )}
        </button>
    );
}
