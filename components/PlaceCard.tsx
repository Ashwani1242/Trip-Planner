"use client";

import { useState } from "react";
import { MarkerData } from "@/types";
import { Trash2, Navigation, Edit2, Check, X, MapPin } from "lucide-react";

interface PlaceCardProps {
    marker: MarkerData;
    onDelete: (id: string) => void;
    onAddToTrip: (marker: MarkerData) => void;
    onRename: (id: string, newName: string) => void;
}

// Category configuration with colors and emojis
const categoryConfig: Record<string, { gradient: string; icon: string; textColor: string }> = {
    Home: { gradient: "from-blue-500 to-blue-600", icon: "🏠", textColor: "text-blue-600 dark:text-blue-400" },
    Work: { gradient: "from-purple-500 to-purple-600", icon: "💼", textColor: "text-purple-600 dark:text-purple-400" },
    Restaurant: { gradient: "from-orange-500 to-orange-600", icon: "🍽️", textColor: "text-orange-600 dark:text-orange-400" },
    Park: { gradient: "from-green-500 to-green-600", icon: "🌳", textColor: "text-green-600 dark:text-green-400" },
    Other: { gradient: "from-gray-500 to-gray-600", icon: "📍", textColor: "text-gray-600 dark:text-gray-400" }
};

export default function PlaceCard({ marker, onDelete, onAddToTrip, onRename }: PlaceCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(marker.title);
    const [isExpanded, setIsExpanded] = useState(false);

    const config = categoryConfig[marker.category] || categoryConfig.Other;

    const handleSave = () => {
        if (editName.trim()) {
            onRename(marker.id, editName);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditName(marker.title);
        setIsEditing(false);
    };

    return (
        <div className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
            <div className={`h-1 bg-linear-to-r ${config.gradient}`} />

            <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl shrink-0">{config.icon}</span>
                        {isEditing ? (
                            <div className="flex items-center gap-1 flex-1">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full text-sm px-2 py-1 rounded border border-primary bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave();
                                        if (e.key === 'Escape') handleCancel();
                                    }} />
                                <button onClick={handleSave} className="text-green-500 hover:text-green-600 p-1">
                                    <Check size={14} />
                                </button>
                                <button onClick={handleCancel} className="text-destructive hover:text-destructive/80 p-1">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <h3 className="font-bold text-sm truncate">{marker.title}</h3>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity p-1" >
                                    <Edit2 size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className={`px-2 py-0.5 rounded-full bg-linear-to-r ${config.gradient} text-white text-[10px] font-bold shrink-0 shadow-sm`}>
                        {marker.category}
                    </div>
                </div>

                {marker.description && (
                    <p className={`text-xs text-muted-foreground mb-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {marker.description}
                    </p>
                )}

                {isExpanded && (
                    <div className="mb-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            <span>{marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Added {new Date(marker.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-border/30">
                    <button
                        onClick={() => onAddToTrip(marker)}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-linear-to-r from-primary/10 to-primary/5 text-primary hover:from-primary/20 hover:to-primary/10 font-medium transition-all flex items-center justify-center gap-1.5 group/btn" >
                        <Navigation size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        Add to Trip
                    </button>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-3 text-xs py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-accent-foreground font-medium transition-colors" >
                        {isExpanded ? 'Less' : 'More'}
                    </button>

                    <button
                        onClick={() => onDelete(marker.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete" >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
