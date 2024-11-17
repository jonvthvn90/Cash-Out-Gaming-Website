import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ForumList = () => {
    const [threads, setThreads] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // Fetch threads when the component mounts or when the user changes
    useEffect(() => {
        if (user) {
            fetchThreads();
        }
    }, [user]);

    const fetchThreads = async () => {
        try {
            const response = await axios.get('/api/forum/threads', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setThreads(response.data.threads);
        } catch (error) {
            console.error('Error fetching threads:', error); // Log for debugging
            setError('Failed to fetch threads');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div>Please log in to view forum threads.</div>;
    }

    if (loading) {
        return <div>Loading forum threads...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="forum-list">
            <h2>Forum</h2>
            {!threads.length ? (
                <p>No threads to display. Start a new one!</p>
            ) : (
                <ul className="thread-list">
                    {threads.map(thread => (
                        <li key={thread._id} className="thread-item">
                            <h3 className="thread-title">{thread.title}</h3>
                            <p className="thread-info">
                                By: {thread.author.username} - {new Date(thread.createdAt).toLocaleDateString()}
                            </p>
                            <Link to={`/forum/thread/${thread._id}`} className="view-thread-link">
                                View Thread
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

ForumList.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired
    })
};

export default ForumList;