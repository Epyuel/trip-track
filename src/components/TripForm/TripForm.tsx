import { useState } from "react";
import { useRouteStore } from "../../hooks/useRouteStore";
import { Button } from "../../ui/buttonPrimary";
import { message } from "antd";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCoordinates = async (location: string,setFindRouteLoading:any) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const data = await response.json();
    if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
    } else {
        message.info(`Coordinates not found for: ${location}`)
        setFindRouteLoading(false)
        throw new Error(`Coordinates not found for: ${location}`);
    }
};

export default function TripForm() {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [stops, setStops] = useState<Array<{ location: string; name: string; estimatedCost: number; stopDuration: number }>>([]);
    const [errors, setErrors] = useState<{ start?: string; end?: string; stops?: string }>({});
    const [findRouteLoading,setFindRouteLoading] = useState(false);

    const { setCoordinates, setMandatoryStops } = useRouteStore();

    const validateForm = () => {
        const newErrors: { start?: string; end?: string; stops?: string } = {};
        if (!start.trim()) newErrors.start = "Start location is required.";
        if (!end.trim()) newErrors.end = "End location is required.";
        if (stops.some((stop) => !stop.location.trim() || !stop.name.trim())) {
            newErrors.stops = "All mandatory stops must have a location and name.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    

    const handleSubmit = async (e: React.FormEvent) => {
        setFindRouteLoading(true)
        e.preventDefault();
        if (!validateForm()) {setFindRouteLoading(false); return;}
        const s = await getCoordinates(start,setFindRouteLoading);
        const en = await getCoordinates(end,setFindRouteLoading);

        // Example coordinates (replace with actual geocoding logic if needed)
        const startCoords: [number, number] = s; // San Francisco
        const endCoords: [number, number] = en; // Sacramento

        const mandatoryStops = await Promise.all(stops.map(async (stop) => ({
                location: await getCoordinates(stop.location,setFindRouteLoading) as [number, number], // Example coordinates (Oakland)
                name: stop.name,
                estimatedCost: stop.estimatedCost,
                stopDuration: stop.stopDuration,
            })
        ));

        // Update the Zustand store
        setCoordinates([startCoords, endCoords]);
        setMandatoryStops(mandatoryStops);
        setFindRouteLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-[#F2FFFE] rounded-lg -z-0">
            <div>
                <label className="block text-sm font-medium text-[#04b4ab]">Start Location Name</label>
                <input
                    type="text"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="mt-1 block w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter start location"
                />
                {errors.start && <p className="text-red-500 text-sm">{errors.start}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-[#04b4ab]">End Location Name</label>
                <input
                    type="text"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="mt-1 block w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter end location"
                />
                {errors.end && <p className="text-red-500 text-sm">{errors.end}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-[#04b4ab]">Mandatory Stops</label>
                {stops.map((stop, index) => (
                    <div key={index} className="mt-4 space-y-4 p-4 bg-blue-100 rounded-md">
                        <div>
                            <label className="block text-sm text-[#04b4ab]">Location</label>
                            <input
                                type="text"
                                placeholder="Enter location"
                                value={stop.location}
                                onChange={(e) =>
                                    setStops(stops.map((s, i) => (i === index ? { ...s, location: e.target.value } : s)))
                                }
                                className="mt-1 block w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[#04b4ab]">Name</label>
                            <input
                                type="text"
                                placeholder="Enter name"
                                value={stop.name}
                                onChange={(e) =>
                                    setStops(stops.map((s, i) => (i === index ? { ...s, name: e.target.value } : s)))
                                }
                                className="mt-1 block w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[#04b4ab]">Estimated Cost ($)</label>
                            <input
                                type="number"
                                placeholder="Enter estimated cost"
                                value={stop.estimatedCost.toString()}
                                onChange={(e) =>
                                    setStops(stops.map((s, i) => (i === index ? { ...s, estimatedCost: parseFloat(e.target.value) || 0 } : s)))
                                }
                                className="mt-1 block w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[#04b4ab]">Stop Duration (mins)</label>
                            <input
                                type="number"
                                placeholder="Enter stop duration"
                                value={stop.stopDuration.toString()}
                                onChange={(e) =>
                                    setStops(stops.map((s, i) => (i === index ? { ...s, stopDuration: parseFloat(e.target.value) || 0 } : s)))
                                }
                                className="mt-1 block w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                ))}
                {errors.stops && <p className="text-red-500 text-sm">{errors.stops}</p>}

                <Button 
                    onClick={() => setStops([...stops, { location: "", name: "", estimatedCost: 0, stopDuration: 0 }])}
                    className="mt-3 w-full mx-auto text-white bg-[#fca27e]"
                >
                    Add Stop
                </Button>
            </div>

            <Button 
                type="submit"
                className="w-full mx-auto text-white bg-[#fca27e]"
                isLoading={findRouteLoading}
            >
                Find Route
            </Button>

        </form>
    );
}