import { Route, Routes } from "react-router-dom";
import TopNav from "./components/TopNav";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import ApplyForVerification from "./pages/ApplyForVerification";
import Student from "./pages/Student";
import PrimaryVerification from "./pages/primary-verifier/PrimaryVerification";
import PrimaryCerts from "./pages/primary-verifier/[id]/CertificatesOfInstitute";
import SecondaryCerts from "./pages/secondary-verifier/[id]/CertificatesOfInstitute";
import ScrollTop from "./components/ScrollTop";
import SecondaryVerification from "./pages/secondary-verifier/SecondaryVerification";

function App() {
  return (
    <div className="source-sans-3">
      <ScrollTop />
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<Student />} />
        <Route path="/student/apply" element={<ApplyForVerification />} />
        <Route path="/primary-verifier" element={<PrimaryVerification />} />
        <Route path="/primary-verifier/:id" element={<PrimaryCerts />} />
        <Route path="/secondary-verifier" element={<SecondaryVerification />} />
        <Route path="/secondary-verifier/:id" element={<SecondaryCerts />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
