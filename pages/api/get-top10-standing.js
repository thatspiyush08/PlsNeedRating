import axios from 'axios';

const INITIAL_RATING = 1500;

async function getContestStandings(contestId, count = 15) {
    try {
      const response = await axios.get(`https://codeforces.com/api/contest.standings`, {
        params: {
          contestId: contestId,
          from: 1,
          count: count,
          showUnofficial: false
        }
      });
      return response.data.result.rows;
    } catch (error) {
      console.error('Error fetching contest standings:', error);
      return [];
    }
  }

async function getUserRatings(usernames) {
  try {
    const response = await axios.get('https://codeforces.com/api/user.info', {
      params: {
        handles: usernames.join(';')
      }
    });
    return response.data.result.reduce((acc, user) => {
      acc[user.handle] = user.rating || INITIAL_RATING;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return {};
  }
}

async function getTotalParticipants(contestId) {
  try {
    let totalParticipants = 0;
    let from = 1;
    const count = 10000;

    while (true) {
      const response = await axios.get('https://codeforces.com/api/contest.standings', {
        params: {
          contestId: contestId,
          from: from,
          count: count,
          showUnofficial: false
        }
      });
      
      const rows = response.data.result.rows;
      totalParticipants += rows.length;

      if (rows.length < count) {
        break;
      }

      from += count;
    }

    return totalParticipants;
  } catch (error) {
    console.error('Error fetching total participants:', error);
    return 0;
  }
}

function calculateRatingChange(rating, rank, totalParticipants) {
  const expectedRank = totalParticipants / (1 + Math.pow(10, (1500 - rating) / 400));
  const performanceRating = rating + 400 * Math.log10(expectedRank / rank);
  return Math.round((performanceRating - rating) / 2);
}


export default async function handler(req, res) {
    const { contestId } = req.query;
  
    if (!contestId) {
      return res.status(400).json({ error: 'Invalid request: contestId is required' });
    }
  
    try {
      const standingsRows = await getContestStandings(contestId);
      const usernames = standingsRows.map(row => row.party.members[0].handle);
      const [userRatings, totalParticipants] = await Promise.all([
        getUserRatings(usernames),
        getTotalParticipants(contestId)
      ]);
  
      const standingsWithRatingChanges = standingsRows.map(row => {
        const username = row.party.members[0].handle;
        const rating = userRatings[username] || INITIAL_RATING;
        const ratingChange = calculateRatingChange(rating, row.rank, totalParticipants);
        return {
          rank: row.rank,
          username: username,
          points: row.points,
          currentRating: rating,
          predictedRatingChange: ratingChange
        };
      });
  
      res.status(200).json(standingsWithRatingChanges);
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }