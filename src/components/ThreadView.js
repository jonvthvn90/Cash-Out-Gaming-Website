import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const ThreadView = ({ match }) => {
    const [thread, setThread] = useState(null);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const { user } = useUser();

    useEffect(() => {
        fetchThreadAndPosts();
    }, [match.params.threadId]);

    const fetchThreadAndPosts = async () => {
        try {
            const response = await axios.get(`/api/forum/threads/${match.params.threadId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setThread(response.data.thread);
            setPosts(response.data.posts);
        } catch (error) {
            setError('Failed to fetch thread or posts');
        } finally {
            setLoading(false);
        }
    };

    const createPost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        try {
            await axios.post(`/api/forum/threads/${match.params.threadId}/posts`, { content: newPostContent }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setNewPostContent(''); // Clear input
            fetchThreadAndPosts(); // Refresh posts
        } catch (error) {
            setError('Failed to create post');
        }
    };

    if (loading) return <div>Loading thread...</div>;
    if (error) return <div>{error}</div>;
    if (!thread) return <div>Thread not found</div>;

    return (
        <div className="thread-view">
            <h2>{thread.title}</h2>
            <p>By: {thread.author.username} - {new Date(thread.createdAt).toLocaleDateString()}</p>
            <div>{thread.content}</div>

            <h3>Posts</h3>
            <ul>
                {posts.map(post => (
                    <li key={post._id}>
                        <p>{post.content}</p>
                        <small>By: {post.author.username} - {new Date(post.createdAt).toLocaleString()}</small>
                    </li>
                ))}
            </ul>

            {user && (
                <form onSubmit={createPost}>
                    <textarea 
                        value={newPostContent} 
                        onChange={(e) => setNewPostContent(e.target.value)} 
                        placeholder="Write a post..."
                    />
                    <button type="submit">Post</button>
                </form>
            )}
        </div>
    );
};

export default ThreadView;