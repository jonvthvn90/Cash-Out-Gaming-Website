import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useUser } from '../context/UserContext';
import ChallengeItem from './ChallengeItem';
import Game from './Game';

const socket = io('http://localhost:8080'); // Update with your server URL

function OngoingChallenges() {
    const[challenges, setChallenges] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const response = await axios.get('/api/challenges/ongoing', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setChallenges(response.data);
            } catch (error) {
                console.error('Error fetching ongoing challenges:', error);
            }
        };

        if (user && user._id) {
            socket.emit('join', user._id);
            fetchChallenges();

            // Listen for real-time challenge updates
            socket.on('challengeStatusUpdated', (updatedChallenge) => {
                setChallenges(prevChallenges => prevChallenges.map(challenge => 
                    challenge._id === updatedChallenge._id ? updatedChallenge : challenge
                ));
            });

            // Clean up listeners when component unmounts
            return () => {
                socket.off('challengeStatusUpdated');
            };
        }
    },[user]);

    return (
        <div>
            <h2>Ongoing Challenges</h2>
            <ul>
                {challenges.map(challenge => (
                    <li key={challenge._id}>
                        <ChallengeItem challenge={challenge} />
                        {challenge.status === 'accepted' && (
                            <Game challenge={challenge} />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default OngoingChallenges;