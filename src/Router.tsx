import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ELDLogger from "./pages/ELDlogger";
import Layout from "./Layout";
import MapPage from "./pages/Map";

const AppRoutes = () => {
  return (
    <Router>
        <Layout>
            <Routes>
                <Route path="/" element={<ELDLogger/>} />
                <Route path="/map" element={<MapPage/>} />
            </Routes>
        </Layout>
    </Router>
  );
};

export default AppRoutes;
