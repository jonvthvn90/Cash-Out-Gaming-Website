import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import PropTypes from 'prop-types';

// Ensure this matches your server's URL for WebSocket
const socket = io('http://localhost:5000');

function ChallengeList({ userId }) {
    const [challenges, setChallenges] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch existing challenges on mount
        fetchChallenges();

        // Listen for new challenges
        socket.on('challengeIssued', handleNewChallenge);

        // Cleanup function for component unmounting or userId change
        return () => {
            socket.off('challengeIssued', handleNewChallenge);
        };
    }, [userId]);

    useEffect(() => {
        // Subscribe to the user's room for real-time updates
        socket.emit('subscribeToRoom', userId);

        // Cleanup subscription when component unmounts or userId changes
        return () => {
            socket.emit('unsubscribeFromRoom', userId);
        };
    }, [userId]);

    const fetchChallenges = async () => {
        try {
            const response = await axios.get(`/api/challenges?opponent=${userId}&status=pending`);
            setChallenges(response.data);
        } catch (error) {
            setError('Error fetching challenges');
            console.error('Error fetching challenges:', error);
        }
    };

    const handleNewChallenge = (challenge) => {
        if (challenge.opponent === userId) {
            setChallenges(prev => [...prev, challenge]);
        }
    };

    const handleResponse = async (challengeId, status) => {
        try {
            // Update challenge status on the server
            const response = await axios.put(`/api/challenges/${challengeId}`, { status });
            if (response.status === 200 || response.status === 201) {
                // Remove the challenge from the list after successful response
                setChallenges(challenges.filter(ch => ch._id !== challengeId));
                alert(`Challenge ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
            } else {
                throw new Error('Unexpected server response');
            }
        } catch (error) {
            setError('Failed to respond to challenge. Please try again.');
            console.error('Error responding to challenge:', error);
        }
    };

    if (error) return <div>Error: {error}</div>;

    return (
        <div className="challenge-list">
            <h3>Incoming Challenges</h3>
            {challenges.length === 0 ? (
                <p>No pending challenges at this time.</p>
            ) : (
                challenges.map(challenge => (
                    <div key={challenge._id} className="challenge-item">
                        <p>{challenge.challenger} challenged you to {challenge.game}</p>
                        <button onClick={() => handleResponse(challenge._id, 'accepted')}>Accept</button>
                        <button onClick={() => handleResponse(challenge._id, 'rejected')}>Reject</button>
                    </div>
                ))
            )}
        </div>
    );
}

ChallengeList.propTypes = {
    userId: PropTypes.string.isRequired
};

export default ChallengeList;