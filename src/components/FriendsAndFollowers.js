import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function FriendsAndFollowers() {
    const[error, setError] = useState(null);
    const[loading, setLoading] = useState(true);
    const[friends, setFriends] = useState([]);
    const[followers, setFollowers] = useState([]);
    const[following, setFollowing] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const friendsResponse = await axios.get('/api/social/friends', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const followersResponse = await axios.get('/api/social/followers', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const followingResponse = await axios.get('/api/social/following', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                setFriends(friendsResponse.data);
                setFollowers(followersResponse.data);
                setFollowing(followingResponse.data);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to fetch social data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Friends</h2>
            <ul>
                {friends.map(friend => (
                    <li key={friend._id}>
                        <img src={friend.avatar} alt={friend.username} width="50" />
                        {friend.username}
                        <button onClick={() => handleFriendAction(friend._id, 'remove')}>Remove Friend</button>
                    </li>
                ))}
            </ul>

            <h2>Followers</h2>
            <ul>
                {followers.map(follower => (
                    <li key={follower._id}>
                        <img src={follower.avatar} alt={follower.username} width="50" />
                        {follower.username}
                    </li>
                ))}
            </ul>

            <h2>Following</h2>
            <ul>
                {following.map(followedUser => (
                    <li key={followedUser._id}>
                        <img src={followedUser.avatar} alt={followedUser.username} width="50" />
                        {followedUser.username}
                        <button onClick={() => handleFollowAction(followedUser._id, 'unfollow')}>Unfollow</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FriendsAndFollowers;