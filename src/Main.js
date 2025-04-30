import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import App from "./App";
import ReplacementDetails from "./ReplacementDetails";
import OriginalDetails from "./OriginalDetails";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import SearchPage from "./pages/SearchPage/SearchPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";

export default function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<App />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="original/:code" element={<OriginalDetails />} />
          <Route path="replacement/:code" element={<ReplacementDetails />} />
          <Route path="category/:name" element={<CategoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
