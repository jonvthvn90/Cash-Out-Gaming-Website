import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function UserBadges() {
    const [userBadges, setUserBadges] = useState([]);
    const [allBadges, setAllBadges] = useState([]);
    const [isLoadingUserBadges, setIsLoadingUserBadges] = useState(true);
    const [isLoadingAllBadges, setIsLoadingAllBadges] = useState(true);
    const [error, setError] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchUserBadges();
            fetchAllBadges();
        } else {
            setIsLoadingUserBadges(false);
            setIsLoadingAllBadges(false);
            setError('Please log in to view badges.');
        }
    }, [user]);

    const fetchUserBadges = async () => {
        setIsLoadingUserBadges(true);
        setError(null);
        try {
            const response = await axios.get(`/api/users/${user._id}?populate=badges`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUserBadges(response.data.badges);
        } catch (error) {
            setError('Failed to fetch user badges');
            console.error('User badges fetch error:', error);
        } finally {
            setIsLoadingUserBadges(false);
        }
    };

    const fetchAllBadges = async () => {
        setIsLoadingAllBadges(true);
        setError(null);
        try {
            const response = await axios.get('/api/badges');
            setAllBadges(response.data);
        } catch (error) {
            setError('Failed to fetch all badges');
            console.error('All badges fetch error:', error);
        } finally {
            setIsLoadingAllBadges(false);
        }
    };

    const checkForBadges = async () => {
        if (isChecking) return; // Prevent multiple checks
        setIsChecking(true);
        setError(null);
        try {
            const response = await axios.post('/api/badges/check', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data && response.data.newBadges) {
                alert(`You've earned ${response.data.newBadges.length} new badges!`);
            }
            // Refresh badges after checking
            fetchUserBadges();
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred checking for badges');
            console.error('Badge check error:', error);
        } finally {
            setIsChecking(false);
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!user) return <div>Please log in to view badges.</div>;

    return (
        <div className="user-badges">
            <h3>Your Badges</h3>
            {isLoadingUserBadges ? (
                <div>Loading your badges...</div>
            ) : (
                userBadges.length === 0 ? (
                    <p>You haven't earned any badges yet.</p>
                ) : (
                    <ul className="badge-list">
                        {userBadges.map(badge => (
                            <li key={badge._id} className="badge-item">
                                <img src={badge.icon} alt={badge.name} className="badge-icon" />
                                <span>{badge.name}</span>
                            </li>
                        ))}
                    </ul>
                )
            )}
            <button 
                onClick={checkForBadges} 
                className="check-badges-button"
                disabled={isLoadingUserBadges || isChecking}
            >
                {isChecking ? 'Checking...' : 'Check for New Badges'}
            </button>
            
            <h3>All Available Badges</h3>
            {isLoadingAllBadges ? (
                <div>Loading all badges...</div>
            ) : (
                <ul className="badge-list">
                    {allBadges.map(badge => (
                        <li key={badge._id} className="badge-item">
                            <img src={badge.icon} alt={badge.name} className="badge-icon" />
                            <div>
                                <span>{badge.name}</span>
                                <p className="badge-description">{badge.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

UserBadges.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    })
};

export default UserBadges;