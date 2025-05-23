import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadcrumbNav from "../../components/BreadcrumbNav/BreadcrumbNav";
import axios from "axios";
import "./ProductDetails.css";
import PartDetailsCard from "../../components/PartDetailsCard/PartDetailsCard";
import ComparisonSection from "../../components/ComparisonSection/ComparisonSection";
import SpecsComparison from "../../components/SpecsComp/SpecsComp";
import SearchBar from "../../components/SearchBar/SearchBar";
import { formatPrice } from "../../utils/utils";
import ChatBot from "../../components/Chatbot/ConversationBot";
import baseUrl from "../../services/base-url";
import { Spin } from "antd";

const ProductDetails = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState("choose");
  const [resourceLink, setResourceLink] = useState(null);

  const [productState, setProductState] = useState({
    original: null,
    replacements: [],
    loading: false,
    error: "",
    commentText: "",
    lastComment: "",
    decision: null,
    busy: false,
  });

  const { original, replacements, loading, error } = productState;

  // Fetch part details
  useEffect(() => {
    if (!code) return;

    setProductState((prev) => ({ ...prev, loading: true, error: "" }));

    axios
      .get(`${baseUrl}/search_exact?q=${encodeURIComponent(code)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const { original, replacements } = res.data;
        localStorage.setItem("categoryId", original.category);
        localStorage.setItem("sereiesName", original.series_name);
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
        fetchPdfLink(original.category, original.series_name);
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
  }, [code, token]);

  const fetchPdfLink = async (category, sereiesName) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${baseUrl}/pdf_link`, {
        params: {
          series_name: sereiesName,
          category_id: category.replace(/\s+/g, "-"),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResourceLink(res.data.pdf_links);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "50px",
          }}
        >
          <Spin size="large" />
        </div>
        <p style={{ textAlign: "center" }}>Loading product details</p>
      </>
    );
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

  const handleChatToggle = () => {
    setIsOpen(!isOpen);
    setStage("choose");
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: isOpen ? "75%" : "100%", transition: "width 0.3s" }}>
        {/* SearchBar Above Container */}
        <div
          className="searchbar-wrapper"
          style={{
            width: "100%",
            padding: "0px 40px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          <SearchBar />
        </div>

        <div>
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
                  resourceLink={resourceLink}
                />
              </div>
            </div>

            {/* Replacement Comparison */}
            {replacements.length > 0 ? (
              <ComparisonSection
                original={original}
                replacements={replacements}
                formatPrice={formatPrice}
                SpecsComparison={SpecsComparison}
              />
            ) : (
              <div className="no-replacements-box">
                <p className="no-replacements-text">
                  No replacements found for this product.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {!isOpen && resourceLink && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
          Know more about{" "}
          {original.category
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </button>
      )}
      <div
        style={{
          width: isOpen ? "25%" : "0",
          transition: "width 0.3s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatBot
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          stage={stage}
          setStage={setStage}
          toggleChat={handleChatToggle}
        />
      </div>
    </div>
  );
};

export default ProductDetails;
