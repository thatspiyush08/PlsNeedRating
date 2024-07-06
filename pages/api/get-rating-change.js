import axios from 'axios';

const INITIAL_RATING = 1500;

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

function calculateRatingChange(rating, rank, totalParticipants) {
    const expectedRank = totalParticipants / (1 + Math.pow(10, (1500 - rating) / 400));
    const performanceRating = rating + 400 * Math.log10(expectedRank / rank);
    return Math.round((performanceRating - rating) / 2);
}

async function getTotalParticipants(contestId) {
    try {
        let totalParticipants = 0;
        let from = 1;
        const count = 10000; // Fetch a large number of participants at once

        while (true) {
            const response = await axios.get('https://codeforces.com/api/contest.standings', {
                params: {
                    contestId: contestId,
                    from: from,
                    count: count,
                    showUnofficial: false // Only count official participants
                }
            });
            
            const rows = response.data.result.rows;
            totalParticipants += rows.length;

            if (rows.length < count) {
                break; // We've fetched all participants
            }

            from += count;
        }

        return totalParticipants;
    } catch (error) {
        console.error('Error fetching total participants:', error);
        return 0;
    }
}

export default async function handler(req, res) {
    const { contestId, username } = req.body;

    if (!contestId || !username) {
        return res.status(400).json({ error: 'Invalid request: contestId and username are required' });
    }

    try {
        const [userRating, standing, totalParticipants] = await Promise.all([
            getUserRating(username),
            getUserStanding(contestId, username),
            getTotalParticipants(contestId)
        ]);
        
        if (!standing) {
            return res.status(404).json({ error: `User ${username} not found in contest ${contestId}` });
        }

        const ratingChange = calculateRatingChange(userRating, standing.rank, totalParticipants);

        res.json({
            username,
            ratingChange,
            currentRating: userRating,
            rank: standing.rank,
            points: standing.points,
            totalParticipants
        });
    } catch (error) {
        console.error('Error calculating rating change:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}