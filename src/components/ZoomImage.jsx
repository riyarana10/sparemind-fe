import React, { useState, useRef } from "react";
import NoImage from ".././assets/img/no_image.jpg";

const ZoomImage = ({ src }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      imageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div style={{ position: "relative", display: "flex", gap: "20px" }}>
      <img
        ref={imageRef}
        src={src || NoImage}
        style={{
          height: "200px",
          width: "auto",
          objectFit: "contain",
          cursor: src ? "zoom-in" : "default",
        }}
        onClick={() => {
          if (src) window.open(src, "_blank");
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        alt="part"
      />

      {isHovering && src && (
        <div
          style={{
            position: "absolute",
            left: "460px",
            top: 0,
            height: "600px",
            width: "800px",
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
