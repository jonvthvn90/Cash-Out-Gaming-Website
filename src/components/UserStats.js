import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const UserStats = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`/api/statistics/${user._id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setStats(response.data);
        } catch (error) {
            setError('Failed to fetch user statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading statistics...</div>;
    if (error) return <div>{error}</div>;
    if (!stats) return <div>No statistics available</div>;

    return (
        <div className="user-stats">
            <h2>Your Statistics</h2>
            <ul>
                <li>Total Games Played: {stats.totalGames}</li>
                <li>Win Rate: {(stats.winRate * 100).toFixed(2)}%</li>
                <li>Average Bet Amount: ${stats.averageBetAmount.toFixed(2)}</li>
                <li>Most Frequent Game: {stats.mostFrequentGame || 'Not Available'}</li>
                <li>Total Hours Played: {stats.totalHoursPlayed || 'Not Available'}</li>
                <li>Longest Win Streak: {stats.longestStreak || 'Not Available'}</li>
                <li>Total Earnings: ${stats.totalEarnings.toFixed(2)}</li>
                <li>Last Updated: {new Date(stats.lastUpdated).toLocaleString()}</li>
            </ul>
        </div>
    );
};

export default UserStats;