import React, { useState, useEffect } from 'react';
import axios from 'axios';
import React from 'react';
import RematchRequest from './RematchRequest';
import RematchResponse from './RematchResponse';
function ChallengeItem({ challenge }) {
    return (
        <li>
            <h4>{challenge.game} - {challenge.status}</h4>
            {challenge.status === 'completed' && (
                <RematchRequest challengeId={challenge._id} />
            )}
            {challenge.isRematch && challenge.status === 'pending' && (
                <RematchResponse rematchId={challenge._id} />
            )}
        </li>
    );
}


function MatchHistory({ userId }) {
    const[matches, setMatches] = useState([]);

    useEffect(() => {
        fetchMatchHistory();
    },[userId]);

    const fetchMatchHistory = async () => {
        try {
            const response = await axios.get(`/api/users/${userId}/matchHistory`);
            setMatches(response.data);
        } catch (error) {
            console.error('Error fetching match history:', error);
            alert('Failed to fetch match history.');
        }
    };

    return (
        <div>
            <h3>Match History</h3>
            <ul>
                {matches.map(match => (
                    <li key={match._id}>
                        {match.game} - Status: {match.status}
                        {match.result && (
                            <span>
                                , Winner: {match.result.winner}, Scores: {JSON.stringify(match.result.scores)}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
    
}
function MatchHistory() {
    const[challenges, setChallenges] = useState([]);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const response = await axios.get('/api/challenges', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
                setChallenges(response.data);
            } catch (error) {
                console.error('Error fetching challenges:', error);
            }
        };

        fetchChallenges();
    }, []);

    return (
        <div>
            <h2>Match History</h2>
            <ul>
                {challenges.map(challenge => (
                    <ChallengeItem key={challenge._id} challenge={challenge} />
                ))}
            </ul>
        </div>
    );
}

export default MatchHistory;


