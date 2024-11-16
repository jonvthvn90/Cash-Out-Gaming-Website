import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('points');
    const { user } = useUser();

    useEffect(() => {
        fetchLeaderboard();
    }, [sortBy]);

    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get(`/api/leaderboard?sortBy=${sortBy}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setLeaderboard(response.data.leaderboard);
        } catch (error) {
            setError('Failed to fetch leaderboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading leaderboard...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="leaderboard">
            <h2>Leaderboard</h2>
            <div>
                Sort by:
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="points">Points</option>
                    <option value="wins">Wins</option>
                    <option value="reputation">Reputation</option>
                </select>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>{sortBy === 'points' ? 'Points' : sortBy === 'wins' ? 'Wins' : 'Reputation'}</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((entry, index) => (
                        <tr key={entry.user} style={{ fontWeight: entry.user === user._id ? 'bold' : 'normal' }}>
                            <td>{index + 1}</td>
                            <td>{entry.username}</td>
                            <td>{entry[sortBy]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;