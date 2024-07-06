// pages/api/search-friend.js

import axios from 'axios';

const INITIAL_RATING = 1500;

async function getUserStanding(contestId, username) {
    try {
        const response = await axios.get(`https://codeforces.com/api/contest.standings`, {
            params: {
                contestId: contestId,
                handles: username,
                showUnofficial: false
            }
        });
        
        if (response.data.result.rows.length === 0) {
            return null;
        }

        const standing = response.data.result.rows[0];

        return {
            rank: standing.rank,
            points: standing.points
        };
    } catch (error) {
        console.error('Error fetching user standing:', error);
        return null;
    }
}

async function getUserRating(username) {
    try {
        const response = await axios.get('https://codeforces.com/api/user.info', {
            params: {
                handles: username
            }
        });

        if (response.data.result.length > 0) {
            return response.data.result[0].rating || INITIAL_RATING;
        }
        return INITIAL_RATING;
    } catch (error) {
        console.error('Error fetching user rating:', error);
        return INITIAL_RATING;
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
    const { contestId, query } = req.query;

    if (!contestId || !query) {
        return res.status(400).json({ error: 'Invalid request: contestId and query are required' });
    }

    try {
        const [userStanding, userRating, totalParticipants] = await Promise.all([
            getUserStanding(contestId, query),
            getUserRating(query),
            getTotalParticipants(contestId)
        ]);

        if (!userStanding) {
            return res.status(404).json({ error: `User ${query} not found in contest ${contestId}` });
        }

        const predictedRatingChange = calculateRatingChange(userRating, userStanding.rank, totalParticipants);

        res.status(200).json({
            username: query,
            rank: userStanding.rank,
            points: userStanding.points,
            currentRating: userRating,
            predictedRatingChange
        });
    } catch (error) {
        console.error('Error searching for friend:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}