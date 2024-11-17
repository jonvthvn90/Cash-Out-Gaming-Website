import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const UserStats = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchStats();
        } else {
            setLoading(false); // If user is not logged in, we stop loading and show an error
        }
    }, [user]);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/statistics/${user._id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setStats(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch user statistics');
            console.error('Stats fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div>Please log in to view your statistics.</div>;
    }
    if (loading) return <div className="loading">Loading statistics...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!stats) return <div className="no-data">No statistics available</div>;

    return (
        <div className="user-stats">
            <h2>Your Statistics</h2>
            <ul className="stats-list">
                <li>Total Games Played: {stats.totalGames}</li>
                <li>Win Rate: {(stats.winRate * 100).toFixed(2)}%</li>
                <li>Average Bet Amount: ${stats.averageBetAmount.toFixed(2)}</li>
                <li>Most Frequent Game: {stats.mostFrequentGame || 'Not Available'}</li>
                <li>Total Hours Played: {stats.totalHoursPlayed ? `${stats.totalHoursPlayed} hours` : 'Not Available'}</li>
                <li>Longest Win Streak: {stats.longestStreak || 'Not Available'}</li>
                <li>Total Earnings: ${stats.totalEarnings.toFixed(2)}</li>
                <li>Last Updated: {new Date(stats.lastUpdated).toLocaleString()}</li>
            </ul>
            <button 
                onClick={fetchStats} 
                className="refresh-stats-button"
                disabled={loading}
            >
                {loading ? 'Refreshing...' : 'Refresh Statistics'}
            </button>
        </div>
    );
};

UserStats.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    })
};

export default UserStats;