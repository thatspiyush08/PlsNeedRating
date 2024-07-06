"use client";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "../pages/Home";
import Preloader from "../pages/Preloader";
import ContestStandings from "../pages/ContestStandings";
import SearchFriend from "../pages/SearchFriend";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              {loading ? (
                <Preloader />
              ) : (
                <div>
                  <div className="main-content">
                    <HomePage />
                  </div>
                </div>
              )}
            </div>
          }
        />
        <Route path="/contest/:contestId" element={<ContestStandings />} />
        <Route path="/search-friend/:contestId" element={<SearchFriend/>} /> 
      </Routes>
    </BrowserRouter>
  );
}
