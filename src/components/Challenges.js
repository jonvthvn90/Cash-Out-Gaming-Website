import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function Challenges() {
    const [challenges, setChallenges] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState('');
    const [betAmount, setBetAmount] = useState(0);
    const [newChallengee, setNewChallengee] = useState('');
    const { user } = useUser();

    // Fetch challenges whenever the user changes or the component mounts
    useEffect(() => {
        fetchChallenges();
    }, [user]);

    const fetchChallenges = useCallback(async () => {
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
    }, []);

    const createChallenge = useCallback(async () => {
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
            // Reset form fields
            setNewChallengee('');
            setGame('');
            setBetAmount(0);
            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred creating the challenge');
        }
    }, [newChallengee, game, betAmount, fetchChallenges]);

    const handleChallengeAction = useCallback(async (challengeId, action, winnerId = null) => {
        try {
            const response = await axios.put(`/api/challenges/${challengeId}/${action}`, 
                action === 'complete' ? { winner: winnerId } : null,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            fetchChallenges(); // Refresh challenges after action
            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred during the challenge action');
        }
    }, [fetchChallenges]);

    if (loading) return <div>Loading challenges...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="challenges">
            <h3>Create a New Challenge</h3>
            <input 
                type="text" 
                value={newChallengee} 
                onChange={(e) => setNewChallengee(e.target.value)} 
                placeholder="Enter Challengee's User ID"
                required
            />
            <input 
                type="text" 
                value={game} 
                onChange={(e) => setGame(e.target.value)} 
                placeholder="Game"
                required
            />
            <input 
                type="number"
                value={betAmount || ''} 
                onChange={(e) => setBetAmount(e.target.value ? parseFloat(e.target.value) : 0)} 
                placeholder="Bet Amount"
                min="0"
            />
            <button onClick={createChallenge} disabled={!newChallengee || !game || betAmount < 0}>Challenge</button>

            <h3>Your Challenges</h3>
            {challenges.length === 0 ? (
                <p>You have no challenges at this time.</p>
            ) : (
                <ul className="challenge-list">
                    {challenges.map(challenge => (
                        <li key={challenge._id} className="challenge-item">
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
            )}
        </div>
    );
}

Challenges.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
    })
};

export default Challenges;