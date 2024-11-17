import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function ChallengeForm({ userId }) {
    const [opponentId, setOpponentId] = useState('');
    const [game, setGame] = useState('');
    const [opponents, setOpponents] = useState([]); // For opponent suggestions or list
    const [error, setError] = useState(null);

    // Fetch potential opponents (optional, based on your app's design)
    useEffect(() => {
        const fetchOpponents = async () => {
            try {
                const response = await axios.get('/api/users', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setOpponents(response.data.users);
            } catch (err) {
                console.error('Failed to fetch opponents:', err);
                // Optionally, you can set an error state here
            }
        };

        fetchOpponents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!game || !opponentId) {
            setError('Please enter both a game and an opponent.');
            return;
        }

        try {
            await axios.post('/api/challenges', {
                challengerId: userId,
                opponentId: opponentId,
                game: game
            });
            alert('Challenge issued successfully!');
            // Optionally, reset form or update UI state
            setGame('');
            setOpponentId('');
            setError(null);
        } catch (error) {
            setError('Failed to issue challenge. Please try again.');
            console.error('Error issuing challenge:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="challenge-form">
            <div>
                <label htmlFor="game">Game:</label>
                <input 
                    type="text" 
                    id="game"
                    value={game} 
                    onChange={(e) => setGame(e.target.value)} 
                    placeholder="Game Name" 
                    required
                />
            </div>
            <div>
                <label htmlFor="opponentId">Opponent:</label>
                <input 
                    type="text" 
                    id="opponentId"
                    value={opponentId} 
                    onChange={(e) => setOpponentId(e.target.value)} 
                    placeholder="Enter Opponent ID or Username"
                    list="opponents-list"
                    required
                />
                <datalist id="opponents-list">
                    {opponents.map(opponent => (
                        <option key={opponent.id} value={opponent.id}>
                            {opponent.username}
                        </option>
                    ))}
                </datalist>
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit">Issue Challenge</button>
        </form>
    );
}

ChallengeForm.propTypes = {
    userId: PropTypes.string.isRequired
};

export default ChallengeForm;