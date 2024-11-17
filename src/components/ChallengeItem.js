import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8080'); // Ensure this matches your server's URL for WebSocket

function ChallengeItem({ challenge }) {
    const [currentChallenge, setCurrentChallenge] = useState(challenge);
    const [error, setError] = useState(null);

    // Check if challenge exists before setting up socket listeners
    useEffect(() => {
        if (challenge && challenge._id) {
            // Subscribe to updates for this challenge
            socket.emit('subscribe', currentChallenge._id);

            // Listen for updates
            socket.on('challengeStatusUpdated', (updatedChallenge) => {
                if (updatedChallenge._id === challenge._id) {
                    setCurrentChallenge(updatedChallenge);
                }
            });

            // Listen for errors
            socket.on('error', (errorMessage) => {
                setError(errorMessage);
            });

            // Clean up listeners on component unmount or if challenge prop changes
            return () => {
                socket.emit('unsubscribe', currentChallenge._id);
                socket.off('challengeStatusUpdated');
                socket.off('error');
            };
        }
    }, [challenge]);

    if (!challenge) {
        return <div>Loading challenge...</div>;
    }

    const statusText = {
        'pending': 'Waiting for response...',
        'accepted': 'Challenge Accepted!',
        'rejected': 'Challenge Rejected',
        'completed': 'Completed!'
    };

    return (
        <li className="challenge-item">
            {error && <p className="error-message">Error: {error}</p>}
            <h4>{currentChallenge.game} - {currentChallenge.status}</h4>
            <p>{statusText[currentChallenge.status] || 'Unknown status'}</p>
            {currentChallenge.status === 'pending' && (
                <div>
                    <button onClick={() => socket.emit('challengeResponse', { challengeId: currentChallenge._id, response: 'accept' })}>
                        Accept
                    </button>
                    <button onClick={() => socket.emit('challengeResponse', { challengeId: currentChallenge._id, response: 'reject' })}>
                        Reject
                    </button>
                </div>
            )}
            {/* Add more UI elements based on challenge status if necessary */}
        </li>
    );
}

export default ChallengeItem;