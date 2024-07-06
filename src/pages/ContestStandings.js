import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './ContestStandings.css'; // Import the CSS file

const ContestStandings = () => {
  const { contestId } = useParams();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await axios.get(`/api/get-top10-standing?contestId=${contestId}`);
        setStandings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch standings');
        setLoading(false);
      }
    };

    fetchStandings();
  }, [contestId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="standings-container">
      <div className="nav-buttons">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to={`/search-friend/${contestId}`} className="nav-link">
          Search for Friend
        </Link>
      </div>
      <h1>Top 15 Participants - Contest {contestId}</h1>
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
          {standings.map(participant => (
            <tr key={participant.username}>
              <td>{participant.rank}</td>
              <td>{participant.username}</td>
              <td>{participant.points}</td>
              <td>{participant.currentRating}</td>
              <td>{participant.predictedRatingChange}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContestStandings;
