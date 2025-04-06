import { RouteResponse } from "../types/type";
import axios from "axios";



export async function getRoute(
  coordinates: [number, number][]
): Promise<RouteResponse | null> {
  try {
    const response = await axios.post<RouteResponse>("https://django-app-latest-e0tn.onrender.com/api/get-route/", {
      coordinates,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) {
      console.error("Network error:", error);
      throw new Error("Network error. Please check your connection.");
    } else {
      console.error("Error fetching route:", error);
      return null;
    }
  }
}

