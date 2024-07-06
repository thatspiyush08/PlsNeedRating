import axios from 'axios';

async function getContestList() {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list');
    const pastContests = response.data.result
      .filter(contest => contest.phase === 'FINISHED')
      .slice(0, 10)
      .map(contest => ({
        id: contest.id,
        name: contest.name,
        startTime: new Date(contest.startTimeSeconds * 1000).toLocaleDateString()
      }));
    
    return pastContests;
  } catch (error) {
    console.error('Failed to fetch contests:', error);
    throw error;
  }
}

export default getContestList;