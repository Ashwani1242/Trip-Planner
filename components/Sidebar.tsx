
"use client";

import { useState } from "react";
import { MarkerData, Waypoint } from "@/types";
import { ThemeToggle } from "./ThemeToggle";
import { Trash2, Navigation, MapPin, GripVertical, Edit2, Check, X } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import PlaceCard from "./PlaceCard";
import CategoryToggle from "./CategoryToggle";

interface SidebarProps {
    markers: MarkerData[];
    onDelete: (id: string) => void;
    onFilterChange: (category: string) => void;
    filter: string;
    tripStats: { distance: number; duration: number };
    waypoints: Waypoint[];
    onAddWaypoint: (marker: MarkerData | { lat: number; lng: number; title: string }) => void;
    onRemoveWaypoint: (id: string) => void;
    onReorderWaypoints: (fromIndex: number, toIndex: number) => void;
    onClearTrip: () => void;
    userLocation: { lat: number; lng: number } | null;
    onRenameMarker: (id: string, newName: string) => void;
}

export default function Sidebar({
    markers,
    onDelete,
    onFilterChange,
    filter,
    tripStats,
    waypoints,
    onAddWaypoint,
    onRemoveWaypoint,
    onReorderWaypoints,
    onClearTrip,
    userLocation,
    onRenameMarker
}: SidebarProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        const el = e.target as HTMLElement;
        el.style.opacity = "0.5";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null) return;
        onReorderWaypoints(draggedIndex, index);
        setDraggedIndex(null);
        (e.target as HTMLElement).style.opacity = "1";
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedIndex(null);
        (e.target as HTMLElement).style.opacity = "1";
    };

    return (
        <div className="w-80 h-full bg-card/95 backdrop-blur-md border-r border-border flex flex-col shadow-2xl z-1000">
            <div className="p-6 border-b border-border flex justify-between items-center bg-linear-to-r from-primary/10 to-transparent">
                <div>
                    <h1 className="text-2xl font-bold">
                        Trip Planner
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium">Plan your journey</p>
                </div>
                <ThemeToggle />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Navigation size={14} /> Current Trip
                        </h2>
                        {waypoints.length > 0 && (
                            <button
                                onClick={onClearTrip}
                                className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors">
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="bg-accent/30 rounded-xl p-3 border border-border/50 space-y-3">
                        {waypoints.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground space-y-3">
                                <p className="text-sm">No stops added yet.</p>
                                {userLocation && (
                                    <button
                                        onClick={() => onAddWaypoint({ ...userLocation, title: "My Location" })}
                                        className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors font-medium">
                                        Start from My Location
                                    </button>
                                )}
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {waypoints.map((wp, index) => (
                                    <li
                                        key={wp.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center gap-2 p-2 rounded-lg bg-background border border-border/50 shadow-sm group cursor-grab active:cursor-grabbing transition-all ${draggedIndex === index ? 'opacity-50 border-dashed border-primary' : ''}`}>
                                        <div className="text-muted-foreground cursor-grab active:cursor-grabbing p-1 hover:text-foreground">
                                            <GripVertical size={14} />
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${wp.type === 'start' ? 'bg-green-500/20 text-green-600' : wp.type === 'end' ? 'bg-red-500/20 text-red-600' : 'bg-blue-500/20 text-blue-600'}`}>
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium truncate flex-1">{wp.name}</span>
                                        <button
                                            onClick={() => onRemoveWaypoint(wp.id)}
                                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                            <X size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {waypoints.length >= 2 && (
                            <div className="pt-2 border-t border-border/50 flex justify-between text-xs font-medium text-muted-foreground">
                                <span>
                                    <AnimatedCounter value={tripStats.distance} decimals={1} suffix=" km" />
                                </span>
                                <span>
                                    <AnimatedCounter value={tripStats.duration} decimals={0} suffix=" min" />
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <MapPin size={14} /> Saved Places
                        </h2>
                    </div>

                    <CategoryToggle
                        categories={["All", "Home", "Work", "Park", "Restaurant", "Other"]}
                        activeCategory={filter}
                        onCategoryChange={onFilterChange}
                    />

                    {markers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8 italic">
                            No places saved yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {markers.map((marker) => (
                                <PlaceCard
                                    key={marker.id}
                                    marker={marker}
                                    onDelete={onDelete}
                                    onAddToTrip={onAddWaypoint}
                                    onRename={onRenameMarker}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

