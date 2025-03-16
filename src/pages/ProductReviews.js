import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ProductReviews = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [showFlagged, setShowFlagged] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/${id}/reviews`);
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    const fetchFlaggedReviews = async () => {
      try {
        const token = localStorage.getItem("token"); // Ensure user is authenticated
        if (!token) return;

        const res = await axios.get(`${API_URL}/api/products/${id}/flaggedreviews`, {
          headers: { "x-auth-token": token },
        });
        console.log(res.data.length);
        if (res.data && Array.isArray(res.data)) {
          setFlaggedReviews(res.data);
        } else {
          setFlaggedReviews([]); // Ensure no undefined state
        }
      } catch (err) {
        console.error("Error fetching flagged reviews:", err);
      }
    };

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        const found = res.data.find((prod) => prod._id === id);
        setProduct(found);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    fetchReviews();
    fetchFlaggedReviews();
    fetchProduct();
  }, [API_URL, id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to post a review");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/products/${id}/reviews`,
        { comment, rating },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
      setReviews([...reviews, res.data.review]);
      setComment("");
      setRating(0);
      setError("");
    } catch (err) {
      console.error("Error posting review:", err);
      setError(err.response?.data?.msg || "Error posting review");
    }
  };

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="back-btn">
        &larr; Back
      </button>
      <h2>{product ? product.name : "Product"} - Reviews</h2>

      {/* Toggle Button for Normal vs. Flagged Reviews */}
      <button
        onClick={() => setShowFlagged(!showFlagged)}
        className="toggle-btn"
      >
        {showFlagged ? "Show Normal Reviews" : "Show Flagged Reviews"}
      </button>

      {/* Review Form */}
      <form onSubmit={handleReviewSubmit} className="review-form">
        <h3>Post a Review</h3>
        {error && <p className="error">{error}</p>}
        <textarea
          placeholder="Write your review here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        ></textarea>
        <input
          type="number"
          placeholder="Rating (0-5)"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          min="0"
          max="5"
          required
        />
        <button type="submit">Submit Review</button>
      </form>

      {/* Reviews Section */}
      <div className="reviews">
        {showFlagged ? (
          <>
            <h3>Flagged Reviews</h3>
            {flaggedReviews.length > 0 ? (
              flaggedReviews.map((rev) => (
                <div key={rev._id} className="review-card flagged">
                  <p className="review-comment">"{rev.comment}"</p>
                  <p className="review-reason">Reason: {rev.reason}</p>
                  <p className="review-user">
                    By: {rev.user?.username || "Anonymous"}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: "red", fontWeight: "bold" }}>
                No flagged reviews found.
              </p>
            )}
          </>
        ) : (
          <>
            <h3>All Reviews</h3>
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="review-card">
                  <p className="review-comment">"{rev.comment}"</p>
                  <p className="review-rating">Rating: {rev.rating}</p>
                  <p className="review-user">
                    By: {rev.user?.username || "Anonymous"}
                  </p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
