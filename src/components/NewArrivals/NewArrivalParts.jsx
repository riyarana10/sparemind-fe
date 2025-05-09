import React from "react";
import "./NewArrivalParts.css";

const products = Array(6).fill({
  title: "AF33-833-A",
  code: "MA0BN01U000",
  price: "₹2,186",
  tag: "NEW",
  image: "/path-to-your-image.png" // Replace with your actual image path
});

const categories = [
    { name: "Air Cylinder", slug: "AIR CYLINDER" },
    { name: "Air Filter", slug: "AIR FILTER" },
    { name: "Air Lubricator", slug: "AIR LUBRICATOR" },
    { name: "Pressure Switch", slug: "PRESSURE SWITCH" },
    { name: "Rodless Cylinder", slug: "RODLESS CYLINDER" },
    // { name: "Solenoid Valve", slug: "SOLENOID VALVE" },
    // { name: "Speed Controller", slug: "SPEED CONTROLLER" },
    // { name: "Pneumatic Seal Kits", slug: "PNEUMATIC SEAL KIT" }
  ];

const NewArrivalParts = () => {
  return (
    <div>
        <div className="new-arrivals-container">
        <div className="new-arrivals-header">
            <h2>NEWLY ARRIVED</h2>
            <a href="/new-arrivals">View All</a>
        </div>
        <div className="card-list">
            {products.map((product, index) => (
            <div className="card" key={index}>
                <span className="tag">{product.tag}</span>
                <img src={product.image} alt={product.title} />
                <div className="product-details">
                    <h3>{product.title}</h3>
                    <div>
                    <p className="item-code">Item Code</p>
                    <p className="item-value">{product.code}</p>
                    </div>
                    <div>
                    <p className="item-code">MRP</p>
                    <p className="price">{product.price}</p>
                    </div>
                </div>
            </div>
            ))}
        </div>
        </div>

        <section className="popular-categories">
        <div className="new-arrivals-header">
            <h2>POPULAR CATEGORIES</h2>
            <a href="/new-arrivals">View All</a>
        </div>
      <div className="category-grid">
        {categories.map((cat, index) => (
          <div className="category-card" key={index}>
            <h3>{cat.name}</h3>
            <p>{cat.slug}</p>
            <p className="view-link">View parts from this category</p>
          </div>
        ))}
      </div>
    </section>
    </div>
  );
};

export default NewArrivalParts;
