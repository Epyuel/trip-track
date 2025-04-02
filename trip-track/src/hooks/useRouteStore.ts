import { create } from "zustand";
import { getRoute } from "../service/api";
import { MandatoryStop, RouteResponse } from "../types/type";

interface RouteState {
  routeData: RouteResponse | null;
  loading: boolean;
  coordinates: [number, number][]; // State for trip coordinates
  mandatoryStops: MandatoryStop[]; // State for mandatory stops
  fetchRoute: (coordinates: [number, number][]) => Promise<void>;
  setCoordinates: (coordinates: [number, number][]) => void; // Action to set coordinates
  setMandatoryStops: (stops: MandatoryStop[]) => void; // Action to set mandatory stops
}

export const useRouteStore = create<RouteState>((set) => ({
  routeData: null,
  loading: false,
  coordinates: [], // Initial state for coordinates
  mandatoryStops: [], // Initial state for mandatory stops

  // Fetch route data
  fetchRoute: async (coordinates) => {
    set({ loading: true });
    try {
      const data = await getRoute(coordinates);
      set({ routeData: data });
    } catch (error) {
      console.error("Error fetching route:", error);
      set({ routeData: null });
    } finally {
      set({ loading: false });
    }
  },

  // Set trip coordinates
  setCoordinates: (coordinates) => set({ coordinates }),

  // Set mandatory stops
  setMandatoryStops: (mandatoryStops) => set({ mandatoryStops }),
}));