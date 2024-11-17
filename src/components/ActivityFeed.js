import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ActivityFeed.css'; 

import Post from './Post';
import NewPostForm from './NewPostForm';

const ActivityFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/posts');
            setPosts(response.data);
        } catch (error) {
            setError('Failed to fetch posts');
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewPost = async (newPost) => {
        try {
            const response = await axios.post('/api/posts', newPost);
            setPosts([response.data, ...posts]);
            setIsFormVisible(false);
        } catch (error) {
            setError('Failed to create new post');
            console.error('Failed to create new post:', error);
        }
    };

    if (loading) return <div>Loading posts...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="activity-feed">
            <h1>Activity Feed</h1>
            <button onClick={() => setIsFormVisible(!isFormVisible)}>
                {isFormVisible ? 'Hide Form' : 'New Post'}
            </button>
            {isFormVisible && <NewPostForm onSubmit={handleNewPost} />}
            <div className="posts">
                {posts.map(post => (
                    <Post key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;