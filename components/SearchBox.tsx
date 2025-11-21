"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, MapPin } from "lucide-react";

interface SearchResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

interface SearchBoxProps {
    onSelect: (loc: { lat: string; lon: string; name: string }) => void;
}

export default function SearchBox({ onSelect }: SearchBoxProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
                );
                const data = await res.json();
                setResults(data);
                setIsOpen(true);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (place: SearchResult) => {
        onSelect({
            name: place.display_name,
            lat: place.lat,
            lon: place.lon,
        });
        setQuery(place.display_name.split(",")[0]); 
        setIsOpen(false);
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative p-4 w-full max-w-md group">
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 group-focus-within:text-primary transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-border/60 bg-background/80 backdrop-blur-md shadow-lg ring-2 ring-primary/10 focus:outline-none focus:ring-primary/50 transition-all placeholder:text-muted-foreground text-sm"
                    placeholder="Search for places, addresses..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin text-muted-foreground" />
                    ) : query ? (
                        <button onClick={handleClear} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X size={18} />
                        </button>
                    ) : null}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute mt-2 w-full bg-card/95 backdrop-blur-md shadow-xl rounded-xl max-h-80 overflow-auto border border-border/50 z-1000 animate-in fade-in slide-in-from-top-2">
                    {results.map((place: SearchResult) => (
                        <div
                            key={place.place_id}
                            className="px-4 py-3 hover:bg-accent/50 cursor-pointer border-b border-border/50 last:border-0 transition-colors flex items-start gap-3"
                            onClick={() => handleSelect(place)} >
                            <div className="mt-0.5 text-muted-foreground shrink-0">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground line-clamp-1">
                                    {place.display_name.split(",")[0]}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {place.display_name.split(",").slice(1).join(",").trim()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
