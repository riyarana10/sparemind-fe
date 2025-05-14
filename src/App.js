import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import SearchPage from "./pages/SearchPage/SearchPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import AllCategoryPage from "./pages/AllCategoryPage/AllCategoryPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/HomePage/HomePage";
import ProductDetails from "./pages/ProductDetails/ProductDetails";

export default function App() {
  const token = localStorage.getItem("access_token");
  return (
    <Router>
      <Routes>
        {token ? (
          <Route path="/" element={<Navbar />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="original/:code" element={<ProductDetails />} />
            <Route path="replacement/:code" element={<ProductDetails />} />
            <Route path="category/:name" element={<CategoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="all-categories" element={<AllCategoryPage />} />
            <Route path="/product/:code" element={<ProductDetails />} />
            <Route path="/login" element={<Navigate to="/" />} />
          </Route>
        ) : (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
