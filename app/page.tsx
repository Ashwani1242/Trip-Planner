"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import SearchBox from "@/components/SearchBox";
import MarkerForm from "@/components/MarkerForm";
import { MarkerData, Waypoint } from "@/types";
import { useSidebar } from "@/context/SidebarContext";
import { HamburgerToggle } from "@/components/HamburgerIcon";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [filter, setFilter] = useState("All");
  const [tripStats, setTripStats] = useState({ distance: 0, duration: 0 });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { isSidebarOpen } = useSidebar();

  useEffect(() => {
    const saved = localStorage.getItem("map-markers");
    if (saved) {
      try {
        console.log("SAVED: ", saved);
        setMarkers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse markers", e);
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("map-markers", JSON.stringify(markers));
    }
  }, [markers, isLoaded]);

  const handleMapClick = (lat: number, lng: number) => {
    setTempMarker({ lat, lng });
  };

  const handleSaveMarker = (data: Omit<MarkerData, "id" | "createdAt">, addToTrip: boolean) => {
    const newMarker: MarkerData = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setMarkers((prev) => [...prev, newMarker]);
    setTempMarker(null);

    if (addToTrip) {
      handleAddWaypoint(newMarker);
    }
  };

  const handleDeleteMarker = (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleRenameMarker = (id: string, newTitle: string) => {
    setMarkers(prev => prev.map(m => m.id === id ? { ...m, title: newTitle } : m));
  };

  const handleSearchSelect = (loc: { lat: string; lon: string; name: string }) => {

    const newMarker: MarkerData = {
      id: crypto.randomUUID(),
      lat: Number(loc.lat),
      lng: Number(loc.lon),
      title: loc.name.split(",")[0],
      description: loc.name,
      category: "Other",
      createdAt: Date.now(),
    };

    setMarkers((prev) => [...prev, newMarker]);
    setTempMarker(null);

    setFocusedLocation({ lat: newMarker.lat, lng: newMarker.lng });
  };

  const handleRouteStats = useCallback((distance: number, duration: number) => {
    setTripStats({ distance, duration });
  }, []);

  const handleAddWaypoint = (marker: MarkerData | { lat: number; lng: number; title: string }) => {
    const type = waypoints.length === 0 ? "start" : "stop";
    const newWaypoint: Waypoint = {
      id: crypto.randomUUID(),
      lat: marker.lat,
      lng: marker.lng,
      name: marker.title,
      type
    };

    setWaypoints(prev => {
      const updated = [...prev, newWaypoint];
      return updated;
    });
  };

  const handleRemoveWaypoint = (id: string) => {
    setWaypoints(prev => prev.filter(w => w.id !== id));
  };

  const handleReorderWaypoints = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setWaypoints(prev => {
      const newWaypoints = [...prev];
      const [movedItem] = newWaypoints.splice(fromIndex, 1);
      newWaypoints.splice(toIndex, 0, movedItem);

      // Update types based on new order
      return newWaypoints.map((wp, index) => ({
        ...wp,
        type: index === 0 ? 'start' : index === newWaypoints.length - 1 ? 'end' : 'stop'
      }));
    });
  };

  const handleClearTrip = () => {
    setWaypoints([]);
    setTripStats({ distance: 0, duration: 0 });
  };

  const handleRequestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setFocusedLocation({ lat: latitude, lng: longitude });
    };

    const error = (err: GeolocationPositionError) => {
      console.error("Error getting location:", err);
      if (err.code === err.TIMEOUT) {
        console.warn("Location request timed out.");
      }
    };

    const options = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  }, []);

  useEffect(() => {
    handleRequestLocation();
  }, [handleRequestLocation]);

  const filteredMarkers = filter === "All"
    ? markers
    : markers.filter((m) => m.category === filter);

  return (
    <div className="flex h-screen bg-background text-foreground relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 h-full transition-transform duration-300 ease-in-out z-1000 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <Sidebar
          markers={filteredMarkers}
          onDelete={handleDeleteMarker}
          onFilterChange={setFilter}
          filter={filter}
          tripStats={tripStats}
          waypoints={waypoints}
          onAddWaypoint={handleAddWaypoint}
          onRemoveWaypoint={handleRemoveWaypoint}
          onReorderWaypoints={handleReorderWaypoints}
          onClearTrip={handleClearTrip}
          userLocation={userLocation}
          onRenameMarker={handleRenameMarker}
        />
      </div>

      <div className={`flex-1 flex flex-col p-0 relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-80' : 'ml-0'
        }`}>
        <div className="absolute top-4 left-4 z-1001">
          <HamburgerToggle />
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-1000 px-4">
          <SearchBox onSelect={handleSearchSelect} />
        </div>

        <div className="absolute inset-0">
          <Map
            markers={filteredMarkers}
            waypoints={waypoints}
            onMapClick={handleMapClick}
            onRouteStats={handleRouteStats}
            userLocation={userLocation}
            onUserLocationUpdate={setUserLocation}
            focusedLocation={focusedLocation}
            isSidebarOpen={isSidebarOpen}
          />

          {tempMarker && (
            <MarkerForm
              lat={tempMarker.lat}
              lng={tempMarker.lng}
              onSave={handleSaveMarker}
              onCancel={() => setTempMarker(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
