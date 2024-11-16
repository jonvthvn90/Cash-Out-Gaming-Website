import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8080'); // Ensure this matches your server's URL for WebSocket

function ChallengeItem({ challenge }) {
    const[currentChallenge, setCurrentChallenge] = useState(challenge);

    useEffect(() => {
        if (challenge) {
            socket.emit('subscribe', currentChallenge._id);

            socket.on('challengeStatusUpdated', (data) => {
                if (data._id === currentChallenge._id) {
                    setCurrentChallenge(data);
                }
            });

            return () => {
                socket.emit('unsubscribe', currentChallenge._id);
                socket.off('challengeStatusUpdated');
            };
        }
    },[challenge]);

    return (
        <li>
            <h4>{currentChallenge.game} - {currentChallenge.status}</h4>
            {currentChallenge.status === 'completed' && (
                <p>Completed!</p>
            )}
            {currentChallenge.status === 'pending' && (
                <p>Waiting for response...</p>
            )}
            {/* Add more UI elements based on challenge status */}
        </li>
    );
}

export default ChallengeItem;