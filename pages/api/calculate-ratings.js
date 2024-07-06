import axios from 'axios';

const INITIAL_RATING = 1500;

function getEloWinProbability(ra, rb) {
    return 1.0 / (1 + Math.pow(10, (rb - ra) / 400.0));
}

function calculateRatingChanges(previousRatings, standingsRows) {
    let contestants = standingsRows.map(row => ({
        party: row.party.members[0].handle,
        rank: row.rank,
        points: row.points,
        rating: previousRatings[row.party.members[0].handle] || INITIAL_RATING,
        delta: 0,
        seed: 1,
        needRating: 0
    }));

    if (contestants.length === 0) return {};

    // Reassign ranks
    contestants.sort((a, b) => b.points - a.points || a.rank - b.rank);
    for (let i = 0; i < contestants.length; i++) {
        contestants[i].rank = i + 1;
    }

    // Calculate seeds
    contestants.forEach(a => {
        a.seed = 1;
        contestants.forEach(b => {
            if (a !== b) a.seed += getEloWinProbability(b.rating, a.rating);
        });
    });

    // Calculate deltas
    contestants.forEach(contestant => {
        let midRank = Math.sqrt(contestant.rank * contestant.seed);
        contestant.needRating = getRatingToRank(contestants, midRank);
        contestant.delta = Math.round((contestant.needRating - contestant.rating) / 2);
    });

    // Adjust deltas to ensure sum is close to zero
    let sum = contestants.reduce((acc, contestant) => acc + contestant.delta, 0);
    let adjustment = -Math.round(sum / contestants.length);
    contestants.forEach(contestant => {
        contestant.delta += adjustment;
    });

    return contestants.reduce((acc, contestant) => {
        acc[contestant.party] = contestant.delta;
        return acc;
    }, {});
}

function getRatingToRank(contestants, rank) {
    let left = 1;
    let right = 8000;

    while (right - left > 1) {
        let mid = Math.floor((left + right) / 2);
        if (getSeed(contestants, mid) < rank) {
            right = mid;
        } else {
            left = mid;
        }
    }

    return left;
}

function getSeed(contestants, rating) {
    let extraContestant = { rating: rating };
    return 1 + contestants.reduce((acc, other) => acc + getEloWinProbability(other.rating, rating), 0);
}

async function getInitialRatings(usernames) {
    const ratings = {};
    try {
        const response = await axios.get(`https://codeforces.com/api/user.info?handles=${usernames.join(';')}`);
        const users = response.data.result;
        users.forEach(user => {
            ratings[user.handle] = user.rating || INITIAL_RATING;
        });
    } catch (error) {
        console.error('Error fetching user ratings:', error);
    }
    return ratings;
}

async function getStandingsRows(contestId, from = 1, count = 10000, showUnofficial = false) {
    try {
        const response = await axios.get(`https://codeforces.com/api/contest.standings`, {
            params: {
                contestId: contestId,
                from: from,
                count: count,
                showUnofficial: showUnofficial
            }
        });
        return response.data.result.rows;
    } catch (error) {
        console.error('Error fetching contest standings:', error);
        return [];
    }
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
    const { contestId } = req.body;

    if (!contestId) {
        return res.status(400).json({ error: 'Invalid request: contestId is required' });
    }

    try {
        const totalParticipants = await getTotalParticipants(contestId);
        let allStandingsRows = [];
        let from = 1;

        while (true) {
            const standingsRows = await getStandingsRows(contestId, from, 10000);
            allStandingsRows = allStandingsRows.concat(standingsRows);
            if (standingsRows.length < 10000) break;
            from += 10000;
        }

        if (allStandingsRows.length === 0) {
            return res.status(400).json({ error: 'Invalid request: unable to fetch standings rows' });
        }

        const usernames = allStandingsRows.map(row => row.party.members[0].handle);
        const initialRatings = await getInitialRatings(usernames);
        const ratingChanges = calculateRatingChanges(initialRatings, allStandingsRows);
        res.json({ ratingChanges, totalParticipants });
    } catch (error) {
        console.error('Error calculating rating changes:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}