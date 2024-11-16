import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function UserBadges() {
    const[userBadges, setUserBadges] = useState([]);
    const[allBadges, setAllBadges] = useState([]);
    const[error, setError] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        fetchUserBadges();
        fetchAllBadges();
    }, []);

    const fetchUserBadges = async () => {
        try {
            const response = await axios.get(`/api/users/${user._id}?populate=badges`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUserBadges(response.data.badges);
        } catch (error) {
            setError('Failed to fetch user badges');
        }
    };

    const fetchAllBadges = async () => {
        try {
            const response = await axios.get('/api/badges');
            setAllBadges(response.data);
        } catch (error) {
            setError('Failed to fetch all badges');
        }
    };

    const checkForBadges = async () => {
        try {
            const response = await axios.post('/api/badges/check', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // Refresh badges after checking
            fetchUserBadges();
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred checking for badges');
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div className="user-badges">
            <h3>Your Badges</h3>
            <ul>
                {userBadges.map(badge => (
                    <li key={badge._id}>
                        <img src={badge.icon} alt={badge.name} width="40" />
                        {badge.name}
                    </li>
                ))}
            </ul>
            <button onClick={checkForBadges}>Check for New Badges</button>
            
            <h3>All Available Badges</h3>
            <ul>
                {allBadges.map(badge => (
                    <li key={badge._id}>
                        <img src={badge.icon} alt={badge.name} width="40" />
                        {badge.name} - {badge.description}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserBadges;