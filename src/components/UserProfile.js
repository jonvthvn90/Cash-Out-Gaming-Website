import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser, updateUser } from '../context/UserContext';
import FriendsAndFollowers from './FriendsAndFollowers';
import Reputation from './Reputation';
import ActivityFeed from './ActivityFeed';
import UserReviews from './UserReviews';
import UserBadges from './UserBadges';
import Challenges from './Challenges';
import Referral from './Referral'; // Import the Referral component

function UserProfile() {
    const[profile, setProfile] = useState(null);
    const[error, setError] = useState(null);
    const[file, setFile] = useState(null);
    const { user, updateUser } = useUser();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`/api/users/${user._id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setProfile(response.data);
        } catch (error) {
            setError('Failed to fetch user profile');
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const uploadAvatar = async () => {
        if (!file) {
            setError('Please select an image file.');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post('/api/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            updateUser({ ...user, avatar: response.data.avatar }); // Update user avatar in context
            fetchUserProfile(); // Refresh profile to update avatar display
            alert('Avatar uploaded successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred uploading the avatar.');
        }
    };

    if (error) return <div>{error}</div>;
    if (!profile) return <div>Loading...</div>;

    return (
        <div className="user-profile">
            <h2>{profile.username}'s Profile</h2>
            <p>Email: {profile.email}</p>
            <p>Balance: ${profile.balance.toFixed(2)}</p>
            <p>Points: {profile.points}</p>
            <p>Reputation: {profile.reputation}</p>
            
            <h3>Avatar</h3>
            <img src={profile.avatar} alt="User Avatar" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            <input type="file" onChange={handleFileChange} accept="image/*" />
            <button onClick={uploadAvatar}>Upload New Avatar</button>

            <h3>Achievements</h3>
            <ul className="achievements-list">
                {profile.achievements && profile.achievements.map(achievement => (
                    <li key={achievement._id} className="achievement-item">
                        <img src={achievement.icon} alt={achievement.name} width="40" />
                        <span>{achievement.name}</span>
                    </li>
                ))}
                {!profile.achievements || profile.achievements.length === 0 && <li>No achievements yet</li>}
            </ul>
            
            <button onClick={() => axios.post('/api/achievements/check', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })}>Check for New Achievements</button>

            <FriendsAndFollowers />
            <Reputation />
            <ActivityFeed />
            <UserReviews userId={user._id} />
            <UserBadges />
            <Challenges />
            <Referral /> {/* Add the Referral component here */}
        </div>
    );
}

export default UserProfile;