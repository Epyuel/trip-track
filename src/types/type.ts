export interface RouteRequest {
  coordinates: [number, number][];
}

export interface RouteResponse {
  routes: {
    summary: {
      distance: number;
      duration: number;
    };
    geometry: string;
  }[];
}

interface Stop {
    location: string
    time: string
    status: string
    type: string
}
  
export interface TripSummaryProps {
    currentLocation: string
    destination: string
    remainingDistance: number
    totalDistance: number
    eta: string
    stops: Stop[]
  }
export interface MandatoryStop {
  location: [number, number];
  name: string;
  estimatedCost: number;
  stopDuration: number;
}

export interface MapProps {
  coordinates: [number, number][];
  mandatoryStops?: MandatoryStop[];
}
