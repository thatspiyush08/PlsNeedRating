import React, { useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './SearchFriend.css'; // Ensure your CSS file path is correct

const SearchFriend = () => {
  const { contestId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/search-friend?contestId=${contestId}&query=${searchQuery}`);
      setSearchResult(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch search results');
      setSearchResult(null);
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="nav-buttons">
        <Link to="/" className="nav-link">Home</Link>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch} disabled={loading}>Search</button>
        </div>
      </div>
      <h1>Search for Friend - Contest {contestId}</h1>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {searchResult && (
        <div className="search-results">
          <table className="standings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Points</th>
                <th>Current Rating</th>
                <th>Predicted Rating Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{searchResult.rank}</td>
                <td>{searchResult.username}</td>
                <td>{searchResult.points}</td>
                <td>{searchResult.currentRating}</td>
                <td>{searchResult.predictedRatingChange}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SearchFriend;
