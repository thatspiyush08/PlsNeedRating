import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import getContestList from '../../pages/api/get-list-contest';
import './Home.css'; 

const Home = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const contestList = await getContestList();
        setContests(contestList); 
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch contests');
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1 className="title">Latest Codeforces Contests</h1>
      <ul className="contest-list">
        {contests.map((contest, index) => (
          <li key={contest.id} className="contest-item" style={{ animationDelay: `${index * 0.1}s` }}>
            <Link to={`/contest/${contest.id}`} className="contest-link">
              <span className="contest-name">{contest.name}</span>
              <span className="contest-date">{contest.startTime}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
