import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from '../context/UserContext';

const socket = io('http://localhost:8080'); // Replace with your server's url

function ChallengeInvitation() {
    const[invitations, setInvitations] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        if (user && user._id) {
            socket.emit('join', user._id);

            socket.on('challengeReceived', (challenge) => {
                setInvitations(prev => [...prev, challenge]);
            });

            return () => {
                socket.off('challengeReceived');
            };
        }
    },[user]);

    const handleResponse = (challengeId, response) => {
        socket.emit('challengeResponse', { challengeId, response });
        setInvitations(prev => prev.filter(inv => inv._id !== challengeId));
    };

    return (
        <div>
            <h2>Challenge Invitations</h2>
            {invitations.map(invite => (
                <div key={invite._id}>
                    <p>{invite.challenger.username} challenges you to {invite.game}</p>
                    <button onClick={() => handleResponse(invite._id, 'accept')}>Accept</button>
                    <button onClick={() => handleResponse(invite._id, 'reject')}>Reject</button>
                </div>
            ))}
        </div>
    );
}

export default ChallengeInvitation;