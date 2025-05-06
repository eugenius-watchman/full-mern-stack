import React, { useEffect, useState } from "react";
//import jwt from "jsonwebtoken";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState("");
  const [error, setError] = useState("");

  // Verify user token
  async function verifyToken() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const response = await fetch("http://localhost:1337/api/verify-token", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Fetch quotes from server
  async function fetchQuotes() {
    try {
      const response = await fetch("http://localhost:1337/api/quotes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }
      const data = await response.json();
      console.log("Full API response:", data); // Logging complete response

      setQuotes(data.quotes || data || []);
      console.log(data);
    } catch (error) {
      console.error("Error fetching quote:", error);
      setError("Failed to load quotes");
      setQuotes([]);
    }
  }

  // Submit new quote
  const submitQuote = async (e) => {
    e.preventDefault();

    if (newQuote.split(/\s+/).length > 200) {
      setError("Quote must be 200 words or less");
      return;
    }

    try {
      const response = await fetch("http://localhost:1337/api/quotes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newQuote }),
      });
      if (response.ok) {
        setNewQuote("");
        setError("");
        fetchQuotes(); // Refresh quotes
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
    }
  };

  // Like a quote
  const likeQuote = async (quoteId) => {
    try {
      await fetch(`http://localhost:1337/api/quotes/${quoteId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchQuotes(); // Refresh quotes
    } catch (error) {
      console.error("Error liking quote:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await verifyToken();
      if (!isAuthenticated) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        await fetchQuotes();
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h1>Inspirational Quotes</h1>

      {/* Quote Submission Form */}
      <div className="quote-form">
        <h2>Share Your Quote</h2>
        <form onSubmit={submitQuote}>
          <textarea
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            placeholder="Write your quote (max 200 words)..."
            maxLength={1000} // Approximate character limit for 200 words
            required
          />
          <div className="word-count">
            {newQuote.split(/\s+/).filter(Boolean).length}/200 words
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Post Quote</button>
        </form>
      </div>

      {/* Quotes Display */}
      <div className="quotes-list">
        <h2>Community Quotes</h2>
        {quotes.length === 0 ? (
          <p>No quotes yet. Be the first to share!</p>
        ) : (
          quotes.map((quote) => (
            <div key={quote._id} className="quote-card">
              <p className="quote-text">"{quote.text}"</p>
              <div className="quote-footer">
                <span className="quote-author">- {quote.author.name}</span>
                <button
                  onClick={() => likeQuote(quote._id)}
                  className="like-button"
                >
                  ♥ {quote.likes || 0}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

// const Dashboard = () => {
//   // Verify user is logged in
//   const navigate = useNavigate();

//   async function populateQuote() {
//     try {
//         const req = await fetch("http://localhost:1337/api/quote", {
//           headers: {
//             "x-access-token": localStorage.getItem("token"),
//           },
//         });
//         const data = await req.json(); // Added await here
//         console.log(data);
//       } catch (error) {
//         console.error("Error fetching quote:", error);
//       }
//   }

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       const user = jwt.decode(token);
//       if (!user) {
//         localStorage.removeItem("token");
//         // window.location.href = '/'
//         navigate("/login");
//       } else {
//         populateQuote();
//       }
//     } else {
//         navigate("/login");
//     }
//   }, [navigate]);

//   return <h1>Hello World</h1>;
// };

// export default Dashboard;
