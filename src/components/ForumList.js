import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const ForumList = () => {
    const [threads, setThreads] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            const response = await axios.get('/api/forum/threads', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setThreads(response.data.threads);
        } catch (error) {
            setError('Failed to fetch threads');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading forum...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="forum-list">
            <h2>Forum</h2>
            <ul>
                {threads.map(thread => (
                    <li key={thread._id}>
                        <h3>{thread.title}</h3>
                        <p>By: {thread.author.username} - {new Date(thread.createdAt).toLocaleDateString()}</p>
                        <a href={`/forum/thread/${thread._id}`}>View Thread</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ForumList;