"use client";

import { useState } from "react";
import { MarkerData, Category } from "@/types";
import { X, Save } from "lucide-react";

interface MarkerFormProps {
    lat: number;
    lng: number;
    onSave: (data: Omit<MarkerData, "id" | "createdAt">, addToTrip: boolean) => void;
    onCancel: () => void;
}

const CATEGORIES: Category[] = ["Home", "Work", "Park", "Restaurant", "Other"];

export default function MarkerForm({ lat, lng, onSave, onCancel }: MarkerFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<Category>("Other");
    const [addToTrip, setAddToTrip] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            lat,
            lng,
            title,
            description,
            category,
        }, addToTrip);
    };

    return (
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto z-1000 w-auto sm:w-80 bg-card/95 backdrop-blur-md text-card-foreground p-4 rounded-xl shadow-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 max-h-[calc(100vh-8rem)] sm:max-h-none overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Add New Place</h3>
                <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g. My Favorite Park"
                        autoFocus />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Optional details..."
                        rows={3} />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="addToTrip"
                        checked={addToTrip}
                        onChange={(e) => setAddToTrip(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="addToTrip" className="text-sm font-medium cursor-pointer select-none">Add to current trip</label>
                </div>

                <div className="text-xs text-muted-foreground">
                    Location: {lat.toFixed(4)}, {lng.toFixed(4)}
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors" >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2" >
                        <Save size={16} />
                        Add Marker
                    </button>
                </div>
            </form>
        </div>
    );
}
