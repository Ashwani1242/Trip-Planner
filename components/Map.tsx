"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MarkerData, Waypoint } from "@/types";
import { Navigation } from "lucide-react";
import { useTheme } from "next-themes";

const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    markers: MarkerData[];
    waypoints: Waypoint[];
    onMapClick: (lat: number, lng: number) => void;
    onRouteStats: (distance: number, duration: number) => void;
    userLocation: { lat: number; lng: number } | null;
    onUserLocationUpdate: (loc: { lat: number; lng: number }) => void;
    focusedLocation?: { lat: number; lng: number } | null;
}

export default function Map({
    markers,
    waypoints,
    onMapClick,
    onRouteStats,
    userLocation,
    onUserLocationUpdate,
    focusedLocation
}: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<{ [key: string]: L.Marker }>({});
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const routeGlowRef = useRef<L.Polyline | null>(null);
    const lastRouteHash = useRef<string>("");
    const userLocationMarkerRef = useRef<L.Marker | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    const { theme } = useTheme();

    useEffect(() => {
        if (focusedLocation && mapRef.current && isMapReady) {
            mapRef.current.flyTo([focusedLocation.lat, focusedLocation.lng], 15, {
                animate: true,
                duration: 1.5
            });
        }
    }, [focusedLocation, isMapReady]);

    const onMapClickRef = useRef(onMapClick);
    useEffect(() => {
        onMapClickRef.current = onMapClick;
    }, [onMapClick]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (!mapRef.current) {
            const map = L.map("map", {
                zoomControl: false,
            }).setView([28.6139, 77.2090], 12);

            L.control.zoom({ position: "bottomright" }).addTo(map);

            map.on("click", (e: L.LeafletMouseEvent) => {
                if (onMapClickRef.current) {
                    onMapClickRef.current(e.latlng.lat, e.latlng.lng);
                }
            });
            mapRef.current = map;
            setIsMapReady(true);
        }
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                mapRef.current?.removeLayer(layer);
            }
        });

        const tileUrl = theme === "dark"
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(mapRef.current);
    }, [theme]);

    useEffect(() => {
        if (!mapRef.current) return;

        Object.values(markersRef.current).forEach(m => m.remove());
        markersRef.current = {};

        markers.forEach((marker) => {
            const m = L.marker([marker.lat, marker.lng], {
                icon: L.divIcon({
                    className: "custom-div-icon",
                    html: `<div style="background-color: hsl(var(--primary)); width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                })
            })
                .bindPopup(`
                    <div class="min-w-[200px]">
                        <h3 class="font-bold text-lg mb-1">${marker.title}</h3>
                        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2 border border-gray-200">
                            ${marker.category}
                        </span>
                        ${marker.description ? `<p class="text-gray-600 text-sm">${marker.description}</p>` : ""}
                        <div class="text-xs text-gray-400 mt-2">
                            Added on ${new Date(marker.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                `)
                .addTo(mapRef.current!);
            markersRef.current[marker.id] = m;
        });

        waypoints.forEach((wp, index) => {
            const m = L.marker([wp.lat, wp.lng], {
                icon: L.divIcon({
                    className: 'custom-waypoint-icon',
                    html: `<div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            })
                .bindPopup(`
                <div class="min-w-[150px]">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">${index + 1}</span>
                        <h3 class="font-bold text-sm">${wp.name}</h3>
                    </div>
                    <p class="text-xs text-gray-500 capitalize">${wp.type}</p>
                </div>
            `)
                .addTo(mapRef.current!);

            markersRef.current[`wp-${wp.id}`] = m;
        });

    }, [markers, waypoints]);


    useEffect(() => {
        if (!mapRef.current) return;

        if (waypoints.length < 2) {
            if (routeLayerRef.current) {
                routeLayerRef.current.remove();
                routeLayerRef.current = null;
            }
            if (routeGlowRef.current) {
                routeGlowRef.current.remove();
                routeGlowRef.current = null;
            }
            lastRouteHash.current = "";
            onRouteStats(0, 0);
            return;
        }

        const currentHash = waypoints.map(w => `${w.lat},${w.lng}`).join("|");
        if (currentHash === lastRouteHash.current) return;

        const fetchRoute = async () => {
            const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(";");
            try {
                const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
                const data = await res.json();

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const coordinates = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);

                    onRouteStats(route.distance, route.duration);

                    if (routeLayerRef.current) {
                        const oldRoute = routeLayerRef.current;
                        oldRoute.setStyle({ opacity: 0 });
                        setTimeout(() => oldRoute.remove(), 300);
                    }
                    if (routeGlowRef.current) {
                        const oldGlow = routeGlowRef.current;
                        oldGlow.setStyle({ opacity: 0 });
                        setTimeout(() => oldGlow.remove(), 300);
                    }

                    const glowLine = L.polyline(coordinates, {
                        color: theme === "dark" ? "#c4b5fd" : "#a78bfa",
                        weight: 10,
                        opacity: 0,
                        className: 'route-glow',
                        lineCap: "round",
                        lineJoin: "round"
                    }).addTo(mapRef.current!);

                    // Add main route layer (on top)
                    const polyline = L.polyline(coordinates, {
                        color: theme === "dark" ? "#a78bfa" : "#8b5cf6",
                        weight: 5,
                        opacity: 0,
                        className: 'animated-route',
                        lineCap: "round",
                        lineJoin: "round"
                    }).addTo(mapRef.current!);

                    setTimeout(() => {
                        glowLine.setStyle({ opacity: 0.3 });
                        polyline.setStyle({ opacity: 0.9 });
                    }, 50);

                    routeGlowRef.current = glowLine;
                    routeLayerRef.current = polyline;
                    lastRouteHash.current = currentHash;

                    mapRef.current?.fitBounds(polyline.getBounds(), { padding: [50, 50] });
                }
            } catch (error) {
                console.error("Failed to fetch route:", error);
            }
        };

        fetchRoute();
    }, [waypoints, theme]);

    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        Object.values(markersRef.current).forEach(m => m.remove());
        markersRef.current = {};

        markers.forEach((marker) => {
            const m = L.marker([marker.lat, marker.lng])
                .bindPopup(`
                    <div class="min-w-[200px]">
                        <h3 class="font-bold text-lg mb-1">${marker.title}</h3>
                        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2 border border-gray-200">
                            ${marker.category}
                        </span>
                        ${marker.description ? `<p class="text-gray-600 text-sm">${marker.description}</p>` : ""}
                        <div class="text-xs text-gray-400 mt-2">
                            Added on ${new Date(marker.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                `)
                .addTo(map);
            markersRef.current[marker.id] = m;
        });

        waypoints.forEach((wp, index) => {

            const m = L.marker([wp.lat, wp.lng], {
                icon: L.divIcon({
                    className: 'custom-waypoint-icon',
                    html: `<div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).bindPopup(`
                <div class="min-w-[150px]">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">${index + 1}</span>
                        <h3 class="font-bold text-sm">${wp.name}</h3>
                    </div>
                    <p class="text-xs text-gray-500 capitalize">${wp.type}</p>
                </div>
            `).addTo(map);

            markersRef.current[`wp-${wp.id}`] = m;
        });

    }, [markers, waypoints]);

    useEffect(() => {
        if (!mapRef.current || !userLocation) return;

        if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        } else {
            const m = L.marker([userLocation.lat, userLocation.lng], {
                icon: L.divIcon({
                    className: 'user-location-icon',
                    html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3b82f6;"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            })
                .bindPopup("You are here")
                .addTo(mapRef.current);
            userLocationMarkerRef.current = m;
        }
    }, [userLocation]);

    const handleLocateMe = () => {
        if (!mapRef.current) return;

        mapRef.current.locate({ setView: true, maxZoom: 16 });

        mapRef.current.once("locationfound", (e) => {
            onUserLocationUpdate({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
    };

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg border border-border">
            <div id="map" className="w-full h-full z-0" />

            <button
                onClick={handleLocateMe}
                className="absolute bottom-24 right-2.5 z-400 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                title="Locate Me" >
                <Navigation size={20} />
            </button>
        </div>
    );
}
