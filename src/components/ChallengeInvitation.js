import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from '../context/UserContext';

// Assuming the server's URL is correctly configured
const socket = io('http://localhost:8080');

function ChallengeInvitation() {
    const [invitations, setInvitations] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        if (user && user._id) {
            // Join the socket room for this user
            socket.emit('join', user._id);

            // Listen for incoming challenge invitations
            socket.on('challengeReceived', (challenge) => {
                setInvitations(prev => [...prev, challenge]);
            });

            // Cleanup function to remove event listeners when component unmounts or user changes
            return () => {
                socket.off('challengeReceived');
                socket.emit('leave', user._id);
            };
        }
    }, [user]);

    // Handle the user's response to the challenge
    const handleResponse = (challengeId, response) => {
        socket.emit('challengeResponse', { challengeId, response });
        setInvitations(prev => prev.filter(inv => inv._id !== challengeId));

        // Optionally, provide feedback to the user
        alert(`You have ${response === 'accept' ? 'accepted' : 'rejected'} the challenge.`);
    };

    if (!user) return null; // Don't render if there's no user

    return (
        <div className="challenge-invitations">
            <h2>Challenge Invitations</h2>
            {invitations.length === 0 ? (
                <p>No pending challenge invitations.</p>
            ) : (
                invitations.map(invite => (
                    <div key={invite._id} className="challenge-item">
                        <p>{invite.challenger.username} challenges you to {invite.game}</p>
                        <button 
                            onClick={() => handleResponse(invite._id, 'accept')} 
                            className="accept-btn"
                        >
                            Accept
                        </button>
                        <button 
                            onClick={() => handleResponse(invite._id, 'reject')} 
                            className="reject-btn"
                        >
                            Reject
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default ChallengeInvitation;