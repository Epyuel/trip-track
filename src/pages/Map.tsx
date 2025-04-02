import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import TripForm from "../components/TripForm/TripForm";
import Map from '../components/Map/map'

export default function MapPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setIsPanelOpen(isDesktop);
  }, [isDesktop]);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background no-scrollbar">
      {/* Map Component */}
      <div className="absolute inset-0 z-0">
        <Map />
      </div>

      {/* Trip Details Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute top-0 right-0 h-full w-80 bg-background/90 backdrop-blur-sm border-l border-border p-4 overflow-y-auto z-20 no-scrollbar"
          >
            <div className="space-y-6">
              <TripForm />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel Toggle Button */}
      <button
        onClick={togglePanel}
        className="absolute top-1/2 z-10 -translate-y-1/2 bg-[#fca27e] text-primary-foreground p-2 rounded-l-md"
        style={{ right: isPanelOpen ? "320px" : "0" }}
      >
        {isPanelOpen ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}