import { Route, Routes } from "react-router-dom";
import TopNav from "./components/TopNav";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import ApplyForVerification from "./pages/ApplyForVerification";
import Student from "./pages/Student";

function App() {
  return (
    <div>
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<Student />} />
        <Route path="/student/apply" element={<ApplyForVerification />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
