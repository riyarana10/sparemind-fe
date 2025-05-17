import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BreadcrumbNav.css";

const BreadcrumbNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split("/").filter(Boolean);

  const buildPath = (index) => "/" + segments.slice(0, index + 1).join("/");

  return (
    <nav className="breadcrumb-nav">
      <span className="breadcrumb-item">
        <button onClick={() => navigate("/")}>Home</button>
        {segments.length > 0 && <span className="breadcrumb-separator">›</span>}
      </span>

      {segments.map((segment, index) => {
        const path = buildPath(index);
        const isLast = index === segments.length - 1;

        const label = decodeURIComponent(segment)
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        // Handle 'original' and 'replacement' as plain labels
        if (segment.toLowerCase() === "original") {
          return (
            <span key={index} className="breadcrumb-item">
              <span>Original</span>
              <span className="breadcrumb-separator">›</span>
            </span>
          );
        }

        if (segment.toLowerCase() === "replacement") {
          return (
            <span key={index} className="breadcrumb-item">
              <span>Replacement</span>
              <span className="breadcrumb-separator">›</span>
            </span>
          );
        }

        return (
          <span key={index} className="breadcrumb-item">
            {!isLast ? (
              <>
                <button onClick={() => navigate(path)}>{label}</button>
                <span className="breadcrumb-separator">›</span>
              </>
            ) : (
              <span className="breadcrumb-current">{label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNav;
