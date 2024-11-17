import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('points');
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchLeaderboard();
        }
    }, [sortBy, user]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
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

    if (!user) {
        return <div>Please log in to view the leaderboard.</div>;
    }

    if (loading) {
        return <div>Loading leaderboard...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="leaderboard">
            <h2>Leaderboard</h2>
            <div className="sort-controls">
                Sort by:
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                    <option value="points">Points</option>
                    <option value="wins">Wins</option>
                    <option value="reputation">Reputation</option>
                </select>
            </div>

            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>{sortBy === 'points' ? 'Points' : sortBy === 'wins' ? 'Wins' : 'Reputation'}</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((entry, index) => (
                        <tr key={entry.user} className={entry.user === user._id ? 'current-user' : ''}>
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

Leaderboard.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    })
};

export default Leaderboard;