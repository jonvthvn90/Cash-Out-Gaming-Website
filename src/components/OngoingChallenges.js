import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useUser } from '../context/UserContext';
import ChallengeItem from './ChallengeItem';
import Game from './Game';
import PropTypes from 'prop-types';

// Update with your server URL
const socket = io('http://localhost:8080');

function OngoingChallenges() {
    const [challenges, setChallenges] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user && user._id) {
            const fetchChallenges = async () => {
                try {
                    const response = await axios.get('/api/challenges/ongoing', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    setChallenges(response.data);
                } catch (error) {
                    setError('Failed to fetch ongoing challenges');
                    console.error('Error fetching ongoing challenges:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchChallenges();
            socket.emit('join', user._id);

            // Listen for real-time challenge updates
            socket.on('challengeStatusUpdated', (updatedChallenge) => {
                setChallenges(prevChallenges => prevChallenges.map(challenge => 
                    challenge._id === updatedChallenge._id ? updatedChallenge : challenge
                ));
            });

            // Listen for errors
            socket.on('error', (message) => {
                setError(message);
            });

            return () => {
                socket.off('challengeStatusUpdated');
                socket.off('error');
                socket.emit('leave', user._id);
            };
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user) {
        return <div>Please log in to view ongoing challenges.</div>;
    }

    if (loading) return <div>Loading ongoing challenges...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="ongoing-challenges">
            <h2>Ongoing Challenges</h2>
            {challenges.length === 0 ? (
                <p>No ongoing challenges.</p>
            ) : (
                <ul className="challenge-list">
                    {challenges.map(challenge => (
                        <li key={challenge._id} className="challenge-item">
                            <ChallengeItem challenge={challenge} />
                            {challenge.status === 'accepted' && (
                                <Game challenge={challenge} />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

OngoingChallenges.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    })
};

export default OngoingChallenges;