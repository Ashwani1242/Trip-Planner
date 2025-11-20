export type Category = "Work" | "Home" | "Park" | "Restaurant" | "Other";

export interface MarkerData {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description?: string;
    category: Category;
    createdAt: number;
}

export interface Waypoint {
    id: string;
    lat: number;
    lng: number;
    name: string;
    type: "start" | "end" | "stop";
}
