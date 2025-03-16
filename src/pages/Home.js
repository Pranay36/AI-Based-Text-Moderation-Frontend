import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };
    fetchProducts();
  }, [API_URL]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Products</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>
      <div className="product-grid">
        {products.map((prod) => (
          <div key={prod._id} className="product-card">
            <h3>{prod.name}</h3>
            <p>{prod.description}</p>
            <p className="price">${prod.price}</p>
            <button onClick={() => navigate(`/product/${prod._id}`)}>
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
