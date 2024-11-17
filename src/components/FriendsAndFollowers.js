import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function FriendsAndFollowers() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchSocialData();
        }
    }, [user]);

    const fetchSocialData = async () => {
        try {
            setLoading(true);
            const [friendsResponse, followersResponse, followingResponse] = await Promise.all([
                axios.get('/api/social/friends', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get('/api/social/followers', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get('/api/social/following', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            setFriends(friendsResponse.data.friends);
            setFollowers(followersResponse.data.followers);
            setFollowing(followingResponse.data.following);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch social data');
        } finally {
            setLoading(false);
        }
    };

    const handleFriendAction = async (userId, action) => {
        try {
            if (action === 'remove') {
                await axios.delete(`/api/social/friends/${userId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
            }
            await fetchSocialData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update friends list');
        }
    };

    const handleFollowAction = async (userId, action) => {
        try {
            if (action === 'unfollow') {
                await axios.delete(`/api/social/following/${userId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
            }
            await fetchSocialData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update follow status');
        }
    };

    if (!user) return <div>Please log in to see your friends and followers.</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="friends-and-followers">
            <section>
                <h2>Friends</h2>
                {friends.length === 0 ? (
                    <p>No friends yet.</p>
                ) : (
                    <ul className="friend-list">
                        {friends.map(friend => (
                            <li key={friend._id} className="friend-item">
                                <img src={friend.avatar} alt={friend.username} width="50" className="friend-avatar" />
                                {friend.username}
                                <button onClick={() => handleFriendAction(friend._id, 'remove')} className="remove-friend">
                                    Remove Friend
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2>Followers</h2>
                {followers.length === 0 ? (
                    <p>No followers yet.</p>
                ) : (
                    <ul className="follower-list">
                        {followers.map(follower => (
                            <li key={follower._id} className="follower-item">
                                <img src={follower.avatar} alt={follower.username} width="50" className="follower-avatar" />
                                {follower.username}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2>Following</h2>
                {following.length === 0 ? (
                    <p>Not following anyone yet.</p>
                ) : (
                    <ul className="following-list">
                        {following.map(followedUser => (
                            <li key={followedUser._id} className="following-item">
                                <img src={followedUser.avatar} alt={followedUser.username} width="50" className="following-avatar" />
                                {followedUser.username}
                                <button onClick={() => handleFollowAction(followedUser._id, 'unfollow')} className="unfollow">
                                    Unfollow
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

FriendsAndFollowers.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        // Additional user properties can be added here
    })
};

export default FriendsAndFollowers;