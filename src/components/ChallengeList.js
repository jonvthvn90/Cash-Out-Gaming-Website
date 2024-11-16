import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function ChallengeList({ userId }) {
    const[challenges, setChallenges] = useState([]);

    useEffect(() => {
        // Fetch existing challenges on mount
        fetchChallenges();

        // Listen for new challenges
        socket.on('challengeIssued', (challenge) => {
            if (challenge.opponent === userId) {
                setChallenges(prev => [...prev, challenge]);
            }
        });

        return () => {
            socket.off('challengeIssued');
        };
    },[userId]);

    const fetchChallenges = async () => {
        try {
            const response = await axios.get(`/api/challenges?opponent=${userId}&status=pending`);
            setChallenges(response.data);
        } catch (error) {
            console.error('Error fetching challenges:', error);
        }
    };

    const handleResponse = async (challengeId, status) => {
        try {
            await axios.put(`/api/challenges/${challengeId}`, { status });
            setChallenges(challenges.filter(ch => ch._id !== challengeId)); // Remove from list
            alert(`Challenge ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
        } catch (error) {
            console.error('Error responding to challenge:', error);
            alert('Failed to respond to challenge.');
        }
    };

    return (
        <div>
            <h3>Incoming Challenges</h3>
            {challenges.map(challenge => (
                <div key={challenge._id}>
                    <p>{challenge.challenger} challenged you to {challenge.game}</p>
                    <button onClick={() => handleResponse(challenge._id, 'accepted')}>Accept</button>
                    <button onClick={() => handleResponse(challenge._id, 'rejected')}>Reject</button>
                </div>
            ))}
        </div>
    );
}

export default ChallengeList;