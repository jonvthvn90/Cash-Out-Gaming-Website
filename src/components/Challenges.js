import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function Challenges() {
    const[challenges, setChallenges] = useState([]);
    const[error, setError] = useState(null);
    const[loading, setLoading] = useState(true);
    const[game, setGame] = useState('');
    const[betAmount, setBetAmount] = useState(0);
    const[newChallengee, setNewChallengee] = useState('');
    const { user } = useUser();

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const response = await axios.get('/api/challenges/user', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setChallenges(response.data);
        } catch (error) {
            setError('Failed to fetch challenges');
        } finally {
            setLoading(false);
        }
    };

    const createChallenge = async () => {
        if (!newChallengee || !game) {
            setError('Please provide a challengee and game');
            return;
        }

        try {
            const response = await axios.post('/api/challenges/create', {
                challengeeId: newChallengee,
                game: game,
                betAmount: betAmount
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            fetchChallenges(); // Refresh challenges
            setGame('');
            setBetAmount(0);
            setNewChallengee('');
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred creating the challenge');
        }
    };

    const handleChallengeAction = async (challengeId, action, winnerId) => {
        try {
            const response = await axios.put(`/api/challenges/${challengeId}/${action}`, 
                action === 'complete' ? { winner: winnerId } : null,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            fetchChallenges(); // Refresh challenges after action
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred during the challenge action');
        }
    };

    if (loading) return <div>Loading challenges...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="challenges">
            <h3>Create a New Challenge</h3>
            <input 
                type="text" 
                value={newChallengee} 
                onChange={(e) => setNewChallengee(e.target.value)} 
                placeholder="Enter Challengee's User ID"
            />
            <input 
                type="text" 
                value={game} 
                onChange={(e) => setGame(e.target.value)} 
                placeholder="Game"
            />
            <input 
                type="number"
                value={betAmount} 
                onChange={(e) => setBetAmount(parseFloat(e.target.value))} 
                placeholder="Bet Amount"
            />
            <button onClick={createChallenge}>Challenge</button>

            <h3>Your Challenges</h3>
            <ul>
                {challenges.map(challenge => (
                    <li key={challenge._id}>
                        {challenge.challenger.username} challenged {challenge.challengee.username} to {challenge.game} - Status: {challenge.status}
                        {challenge.status === 'pending' && 
                            (user._id === challenge.challengee.toString() ? 
                                <>
                                    <button onClick={() => handleChallengeAction(challenge._id, 'accept')}>Accept</button>
                                    <button onClick={() => handleChallengeAction(challenge._id, 'reject')}>Reject</button>
                                </> : 
                                <span>Waiting for response...</span>
                            )
                        }
                        {challenge.status === 'accepted' && user._id === challenge.challengee.toString() && 
                            <button onClick={() => handleChallengeAction(challenge._id, 'complete', user._id)}>Complete</button>
                        }
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Challenges;