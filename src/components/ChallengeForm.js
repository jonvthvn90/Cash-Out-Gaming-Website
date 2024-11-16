import React, { useState } from 'react';
import axios from 'axios';

function ChallengeForm({ userId }) {
    const[opponentId, setOpponentId] = useState('');
    const[game, setGame] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/challenges', { challengerId: userId, opponentId, game });
            alert('Challenge issued successfully!');
            // Reset form or update UI
        } catch (error) {
            console.error('Error issuing challenge:', error);
            alert('Failed to issue challenge.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={game} onChange={(e) => setGame(e.target.value)} placeholder="Game Name" />
            <button type="submit">Issue Challenge</button>
        </form>
    );
}

export default ChallengeForm;