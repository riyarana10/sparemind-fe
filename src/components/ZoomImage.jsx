import React, { useState, useRef, useEffect } from "react";
import NoImage from ".././assets/img/no_image.jpg";

const ZoomImage = ({ src }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [zoomDirection, setZoomDirection] = useState("right");
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const checkPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      if (rect.right > windowWidth * 0.7) {
        setZoomDirection("left");
      } else {
        setZoomDirection("right");
      }
    }
  };

  useEffect(() => {
    checkPosition();

    const handleResize = () => {
      checkPosition();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    const observer = new MutationObserver(checkPosition);
    if (containerRef.current) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      imageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "flex", gap: "20px" }}
    >
      <img
        ref={imageRef}
        src={src || NoImage}
        style={{
          height: "200px",
          width: "200px",
          objectFit: "contain",
          cursor: src ? "zoom-in" : "default",
        }}
        onClick={() => {
          if (src) window.open(src, "_blank");
        }}
        onMouseEnter={() => {
          checkPosition(); // Check position when mouse enters
          setIsHovering(true);
        }}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        alt="part"
      />

      {isHovering && src && (
        <div
          style={{
            position: "absolute",
            left: zoomDirection === "left" ? "auto" : "462px",
            right: zoomDirection === "left" ? "450px" : "auto",
            top: 0,
            height: "500px",
            width: "500px",
            border: "1px solid #ccc",
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundSize: "200%",
            zIndex: 1000,
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            backgroundColor: "#fff",
          }}
        />
      )}
    </div>
  );
};

export default ZoomImage;
