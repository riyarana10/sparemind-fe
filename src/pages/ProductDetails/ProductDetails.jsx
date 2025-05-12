import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadcrumbNav from "../../components/BreadcrumbNav";
import axios from "axios";
import "./ProductDetails.css";
import PartDetailsCard from "../../components/PartDetailsCard";
import ComparisonSection from "../../components/ComparisonSection";
import SpecsComparison from "../../components/SpecsComp/SpecsComp";
import SearchBar from "../../components/SearchBar";
import { pdfLinks } from "../../productConstants";
import { formatPrice } from "../../productUtils";


const ProductDetails = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const role = payload.role || "user";

  const [productState, setProductState] = useState({
    original: null,
    replacements: [],
    loading: false,
    error: "",
    commentText: "",
    lastComment: "",
    decision: null,
    busy: false,
    compareOther: {},
  });

  const {
    original,
    replacements,
    loading,
    error,
    commentText,
    lastComment,
    decision,
    busy,
    compareOther,
  } = productState;

  // Fetch part details
  useEffect(() => {
    if (!code) return;

    setProductState((prev) => ({ ...prev, loading: true, error: "" }));

    axios
      .get(`http://localhost:8000/search_exact?q=${encodeURIComponent(code)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const { original, replacements } = res.data;
        setProductState((prev) => ({
          ...prev,
          original,
          replacements: replacements || [],
          lastComment: original?.comment || "",
          decision: original.accepted
            ? "accepted"
            : original.rejected
            ? "rejected"
            : null,
        }));
      })
      .catch((err) => {
        console.error("Load failed:", err);
        setProductState((prev) => ({
          ...prev,
          error: "Could not load part details.",
        }));
      })
      .finally(() => {
        setProductState((prev) => ({ ...prev, loading: false }));
      });
  }, [code]);

  const handleDecision = async (accepted, rejected, comment) => {
    setProductState((prev) => ({ ...prev, busy: true }));
    try {
      await axios.post(
        "http://localhost:8000/decision",
        {
          original_part_item_code: original.original_part_item_code,
          replacement_part_item_code: "",
          accepted,
          rejected,
          comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProductState((prev) => ({
        ...prev,
        decision: accepted ? "accepted" : rejected ? "rejected" : null,
        lastComment: comment,
        commentText: "",
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to save your decision.");
    } finally {
      setProductState((prev) => ({ ...prev, busy: false }));
    }
  };

  if (loading) return <p>Loading part...</p>;
  if (error) return <p className="error-message">{error}</p>;

  if (!original) {
    return (
      <div className="app-container">
        <h1>Original Part Details</h1>
        <p>No such part found.</p>
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  const category = original.category?.toUpperCase().trim();
  const resourceLink = pdfLinks[category];

  return (
    <>
      {/* SearchBar Above Container */}
      <div
        className="searchbar-wrapper"
        style={{ width: "100%", padding: "16px" }}
      >
        <SearchBar />
        <BreadcrumbNav />
      </div>

      <div className="product-details-container">
        <div className="main-content">
          <div className="product-card">
            <div className="card-details">
              <PartDetailsCard
                part={original}
                isOriginal={true}
                formatPrice={formatPrice}
                resourceLink={pdfLinks[original.category?.toUpperCase().trim()]}
              />
            </div>
          </div>

          {/* Replacement Comparison */}
          {replacements.length > 0 && (
            <ComparisonSection
              original={original}
              replacements={replacements}
              compareOther={compareOther}
              setCompareOther={(value) =>
                setProductState((prev) => ({ ...prev, compareOther: value }))
              }
              formatPrice={formatPrice}
              SpecsComparison={SpecsComparison}
            />
          )}

          {/* Back Button */}
          {/* <button className="back-button" onClick={() => navigate(-1)}>
            Back
          </button> */}
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
