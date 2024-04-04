import { Route, Routes } from "react-router-dom";
import TopNav from "./components/TopNav";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import ApplyForVerification from "./pages/ApplyForVerification";

function App() {
  return (
    <div>
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/applicant" element={<ApplyForVerification />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
