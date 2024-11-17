import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser, updateUser } from '../context/UserContext';
import FriendsAndFollowers from './FriendsAndFollowers';
import Reputation from './Reputation';
import ActivityFeed from './ActivityFeed';
import UserReviews from './UserReviews';
import UserBadges from './UserBadges';
import Challenges from './Challenges';
import Referral from './Referral';
import PropTypes from 'prop-types';

function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, updateUser } = useUser();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/users/${user._id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setProfile(response.data);
        } catch (error) {
            setError('Failed to fetch user profile');
            console.error('Profile fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null); // Clear any previous errors
    };

    const uploadAvatar = async () => {
        if (!file) {
            setError('Please select an image file.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post('/api/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            updateUser({ ...user, avatar: response.data.avatarUrl }); // Assuming server returns 'avatarUrl'
            fetchUserProfile(); // Refresh profile to update avatar display
            alert('Avatar uploaded successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred uploading the avatar.');
            console.error('Avatar upload error:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkForNewAchievements = async () => {
        try {
            const response = await axios.post('/api/achievements/check', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.newAchievements.length > 0) {
                alert(`You've earned ${response.data.newAchievements.length} new achievements!`);
                fetchUserProfile(); // Refresh profile to update achievements
            } else {
                alert('No new achievements this time.');
            }
        } catch (error) {
            setError('Failed to check for new achievements');
            console.error('Achievement check error:', error);
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (loading) return <div>Loading profile...</div>;
    if (!profile) return <div>Profile not found</div>;

    return (
        <div className="user-profile">
            <h2>{profile.username}'s Profile</h2>
            <p>Email: {profile.email}</p>
            <p>Balance: ${profile.balance.toFixed(2)}</p>
            <p>Points: {profile.points}</p>
            <p>Reputation: {profile.reputation}</p>
            
            <h3>Avatar</h3>
            <img 
                src={profile.avatar || '/default-avatar.png'} 
                alt="User Avatar" 
                className="profile-avatar" 
                style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '50%' }}
            />
            <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*" 
                className="avatar-upload"
                disabled={loading}
            />
            <button 
                onClick={uploadAvatar} 
                className="avatar-upload-button"
                disabled={loading || !file}
            >
                {loading ? 'Uploading...' : 'Upload New Avatar'}
            </button>

            <h3>Achievements</h3>
            <ul className="achievements-list">
                {profile.achievements && profile.achievements.length > 0 ? 
                    profile.achievements.map(achievement => (
                        <li key={achievement._id} className="achievement-item">
                            <img src={achievement.icon} alt={achievement.name} className="achievement-icon" />
                            <span>{achievement.name}</span>
                        </li>
                    )) : 
                    <li className="no-achievements">No achievements yet</li>
                }
            </ul>
            
            <button 
                onClick={checkForNewAchievements} 
                className="check-achievements-button"
                disabled={loading}
            >
                Check for New Achievements
            </button>

            <FriendsAndFollowers userId={user._id} />
            <Reputation />
            <ActivityFeed />
            <UserReviews userId={user._id} />
            <UserBadges />
            <Challenges />
            <Referral />
        </div>
    );
}

UserProfile.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    }).isRequired
};

export default UserProfile;