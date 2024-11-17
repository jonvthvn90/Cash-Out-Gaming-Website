import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const ThreadView = ({ match }) => {
    const [thread, setThread] = useState(null);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [posting, setPosting] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (match.params.threadId) {
            fetchThreadAndPosts();
        }
    }, [match.params.threadId]);

    const fetchThreadAndPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/forum/threads/${match.params.threadId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setThread(response.data.thread);
            setPosts(response.data.posts);
        } catch (error) {
            setError('Failed to fetch thread or posts');
            console.error('Thread fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const createPost = async (e) => {
        e.preventDefault();
        if (posting || !newPostContent.trim()) return;

        setPosting(true);
        setError(null);

        try {
            const response = await axios.post(`/api/forum/threads/${match.params.threadId}/posts`, { content: newPostContent.trim() }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setNewPostContent(''); // Clear input
            setPosts([...posts, response.data.post]); // Optimistically add the post
            setTimeout(fetchThreadAndPosts, 500); // Refresh posts after a short delay to ensure the optimistic update shows
        } catch (error) {
            setError('Failed to create post');
            console.error('Post creation error:', error);
        } finally {
            setPosting(false);
        }
    };

    if (loading) return <div>Loading thread...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!thread) return <div className="not-found">Thread not found</div>;

    return (
        <div className="thread-view">
            <h2>{thread.title}</h2>
            <p>By: {thread.author.username} - {new Date(thread.createdAt).toLocaleString()}</p>
            <div className="thread-content">{thread.content}</div>

            <h3>Posts</h3>
            <ul className="posts-list">
                {posts.map(post => (
                    <li key={post._id} className="post-item">
                        <p className="post-content">{post.content}</p>
                        <small className="post-author">By: {post.author.username} - {new Date(post.createdAt).toLocaleString()}</small>
                    </li>
                ))}
            </ul>

            {user && (
                <form onSubmit={createPost} className="new-post-form">
                    <textarea 
                        value={newPostContent} 
                        onChange={(e) => setNewPostContent(e.target.value)} 
                        placeholder="Write a post..."
                        className="post-textarea"
                        required
                    />
                    <button type="submit" className="post-button" disabled={posting}>
                        {posting ? 'Posting...' : 'Post'}
                    </button>
                </form>
            )}
        </div>
    );
};

ThreadView.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            threadId: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default ThreadView;